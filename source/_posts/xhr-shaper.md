---
title: "XHR-shaper: A network conditioner that throtlles XMLHttpRequest (that runs in the browser)"
date: 2017-06-09 20:56:01
tags:
---

# How to emulate bandwidth conditons in the browser?

In the past two years I have been working a lot with JavaScript-based adaptive streaming engines. Sometime in 2016 it occured to me: there is actually a way we would be able to throttle the network traffic of the browser, from within the browser (if you are not into the topic, I'll explain why that is a big deal to me further below). That idea was what led me to build **XHR-shaper** in the end.

# What is XHR-Shaper? 

It's a JavaScript module that hooks into the standard XMLHttpRequest (that is what browser-code uses to make HTTP requests). To do that, it sits in between the actual request and the standard application API which it mimics effectively - then it shapes the behavior of the state and events in such way that emulates a certain bandwidth and latency. That's it.

You can try it out here: https://tchakabam.github.io/xhr-shaper/

And here is the project repository: https://github.com/tchakabam/xhr-shaper

So for example with that installed one can say:

```
// all requests will be limited to 64kbps and take at least 5000 ms
XMLHttpRequest.Shaper.maxBandwidth = 64;
XMLHttpRequest.Shaper.minLatency = 3000;
```

And then all requests in that browser window will be really pretty slow.

The cool thing about that is, you can just set it up on any page or app, and then just test/play with various network conditions, without needing to actually let the app or the test-suite know about it.

When you want to integrate automated tests in browsers with it, it's easy as saying hello. 

You can also limit it to one specific request by applying it to the specific XHR instance, but that will of course have you make your application of it:

```
// Set your minimum desired latency
xhr.shaper.minLatency = 1000;

// Set your maximum desired bandwidth
xhr.shaper.maxBandwidth = 512;
```

Here you can see a screenshot of the demo page (included in the project), where we see traces from three requests, at 500, 1000, 2000 and 10000kbps respectively. The demo page allows you to test downloading a chunk of data from a CDN (which is part of a popular test stream) - you can set max bandwidth and min latency to see how it affects the download - and traces the result in a graph.

<img id="xhr-shaper-demo" src="/blog/images/xhr-shaper-demo.png" href="/blog/images/xhr-shaper-demo.png">

And finally (to close the gap to all other tech blog articles), YES you can find (and install) this via npm:

```
npm install xhr-shaper
```

# What the heck do you need it for?

As long as I have been working with adaptive video streaming, we had to do network emulation to test what we were doing. That means that we are emulating certain conditions of the network, like bandwidth limitation and latency for example. Hence why the tools that are doing that are called "Network conditioner".

There are basically two ways to do it: via the client or server system on the IP network layer, or via specific throtlling of responses on the application layer, which can also be done on client and server.

When you want to setup automated testing with it usually is a hassle. But I have been through it :) The problem is that most of the time you'll want to use tools that run on the client system, since your server is usually a static CDN when you work with media streaming (so no throttling applicable there..). So when you want to test that your adaptation algorithms run correctly, you need drive that system-wide tool at the same time - that is feasible when your test-suite actually runs on the command-line. When you want to run such tests with a browser - well that's when things might get really tricky. In that case you may want to proxy all of your media-requests via a local proxy that does the traffic throttling - the browser can then control the throttling behavior via some controller endpoint of it. But all that seems really a bit of a hassle no?

# How does XHR-shaper work exactly?

It's really pretty simple. First we are over-writing the XHR in the `window` object with our own implementation, called `XHRProxy`. It really does nothing except proxying all the functions, properties and constructor to an internal "real" XHR object (we keep a ref to that constructor before we overwrite). So it works a bit like what developers in the browser-world call `shim` or `polyfill`, but the other way around :) Or the same. Just that in the end to do the download it needs to use the native already existing component.

Anyway. Then we are extending that proxy object at construction with some hooks, that will basically catch all of the event listeners that would usually attach directly to the native object. Also, we are masking parts of the XHR state with our stuff, so `response`, `readyState`, `status`, etc ....

Now as the request happens, we are progressively triggering events and setting the state in the shape of the given emulation parameters - it's that simple.

The main problem was really to not only deal with the usual `onreadystatechange` way to use the XHR, but to enable it to all kinds of things people may do with it. That also included correctly implementing `EventTarget`, but also making sure we really catch all events. Did you know there was not only `load`, but also `loadstart`. Yes sure. But then also `loadend`. So all of that was a bit tricky, but - it works now finally.

# Using it as a cache

Eventually I thought, it could not only slow down requests but also speed them up.

No, on a serious note, what happened was that I had implemented some caching logic into a streaming engine, and then was working on XHR-shaper later. That caching module was so simple, that it was really just mapping URL's to some sort of data (while limited to a max-total-size and purging oldest items).

So I thought, why could I not just cache everything that happens in the browser inside my own cache module. XHR-shaper opens me the gates of total requests manipulation. It's really like having a proxy inside the browser.

Turns out yes you can do that. You can really cache *everything* that the browser gets, and deliver it to your application further times at zero-time. That is not only a good news for streaming-engines. The feature is in there and works, but it's not yet tested in all aspects - at your own risks if you want to put this into something production-ready.

What is cool about the cache feature when it comes to streaming engines? Well usually with video streaming, you deal with quite a lot of data. So when you just write it into the native playback buffer of the browser i.e `SourceBuffer` of the `MediaSource` API, the browser will trim that buffer in unpredictable ways as soon as you put too much data in there. That's why usually media-engines actually trim that buffer behind the playhead. In simple words: That's why when you watch a long movie, it needs to rebuffer when you seek back, even if you had already loaded that part before.

The above problem is pretty lame, which is why media-engines can make good use of caches where they store their media data (i.e video stream segments) outside the native buffer. And then pull it out when they need to feed the buffer with that data again.

The cool thing now is with XHR-Shaper you can provide such a cache to any media-engine transparently, without it knowing about it (as long as it used XHRs to pull its data - it might not work with non-standard things).

# Fetch API

There will be a new API in browsers to make requests, it's called `Fetch`. With that, building such a network conditioner will actually be even "simpler" - I hope.


<script type="text/javascript">
	new Luminous(document.querySelector('#xhr-shaper-demo'));
</script>

<style>
	img {
		cursor: pointer;
	}

	.lum-lightbox.lum-open {
		max-width: 90%;
    	margin: auto;
	}

	.lum-lightbox.lum-open img {
		border: 1px solid black;
	}
</style>