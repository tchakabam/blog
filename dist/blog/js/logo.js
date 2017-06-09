var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;
var middle = canvas.height / 2;
var t0;
var timestep;
var now;

window.requestAnimationFrame(animate);
function animate() {

	now = Date.now();
	t0 = t0 || now;
	timestep = now - t0;

	draw && draw();
	window.requestAnimationFrame(animate);
}

function sin(f, t, d) {
	d = d || 0;
	return Math.sin(f* 2*Math.PI * ((t / 1000) - d));
}

var middle_, width_;

var clickShock = 0;

function react1(event) {
	//console.log('click');
	if (clickShock < 30) {
		clickShock = 70;
	} else if (clickShock < 70) {
		clickShock += 10;
	}
	
	if (event.type === 'click') {
		window.location = '/';
	}
}

function draw() {

	if (!canvas.onclick) {
		canvas.onmouseover = canvas.onclick = react1;

		var navListItems = document.querySelectorAll('.nav-list-item');
		for(var i=0; i < navListItems.length; i++) {
			navListItems[i].addEventListener('mouseover', react1);
		}
	}

	if (clickShock > 0) {
		clickShock = 0.99*clickShock;
		if (clickShock <= 1) {
			clickShock = 0;
		}
	}

	ctx.clearRect(0, 0, width, height);

	//ctx.fillStyle = '#024'
	ctx.fillStyle = '#fff'
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#036';

	ctx.beginPath();
	ctx.arc(width/2, height/2, width/2 - 1, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();

	var rand0 = Math.random();
	var rand1 = Math.random();
	var rand2 = Math.random();

	var sin0 = (clickShock/100)*2 + sin(0.5, now, rand0 / 100 - timestep/1000 + rand2/100);
	var sin1 = (clickShock/100)*0.5 + sin(0.1, now, -0.6);
	var sin2 = -(clickShock/100)*0.2 + sin(0.3, now, 0.6 + sin1);
	var sin3 = +(clickShock/100)*1.5 + sin(0.7, now, rand1 / 100 + sin3*3);

	/*
	ctx.strokeStyle = '#00f';
	ctx.beginPath();
	ctx.bezierCurveTo(0, middle, width/2 + (sin3/3)*width/2, sin0*height + sin1*middle, width, middle);
	ctx.stroke();

	ctx.strokeStyle = '#009';
	ctx.beginPath();
	ctx.bezierCurveTo(0, middle, width/3 + (sin1/2)*width/4, sin3*height + sin2*middle, width, middle);
	//ctx.bezierCurveTo(0, middle, width/3 + (sin1/2)*width/4, sin3*height + sin2*middle, width, middle);
	ctx.stroke();

	ctx.strokeStyle = '#005';
	ctx.beginPath();
	ctx.bezierCurveTo(0, middle, width/3 + (sin2/2)*width/4, sin1*height + sin3*middle, width, middle);
	ctx.stroke();
	*/

	middle_ = middle_ || middle;
	width_ = width_ || width;

	middle = sin0 * middle_ / 16 + middle_ - sin3* width/16;
	width = 1.3* (sin1 * width_ / 4 + width_ - sin2* middle/8) + clickShock;

	var numBeziers = 4;
	var segmentWidth = width / numBeziers;
	for(var i=0; i < numBeziers; i++) {
		var mod = i % 2 === 0 ? sin0 : -sin0;
		ctx.strokeStyle = '#00f';
		ctx.beginPath();
		ctx.bezierCurveTo(i * segmentWidth, middle,
							i*segmentWidth + segmentWidth/2, mod * height/4 + middle,
							(i+1) * segmentWidth, middle);
		ctx.stroke();
	}

	var numBeziers = 3;
	var segmentWidth = width / numBeziers;
	for(var i=0; i < numBeziers; i++) {
		var mod = i % 2 === 0 ? sin1 : -sin1;
		ctx.strokeStyle = '#004';
		ctx.beginPath();
		ctx.bezierCurveTo(i * segmentWidth, middle,
							i*segmentWidth + segmentWidth/2, mod * height/4 + middle,
							(i+1) * segmentWidth, middle);
		ctx.stroke();
	}

	var numBeziers = 3;
	var segmentWidth = width / numBeziers;
	for(var i=0; i < numBeziers; i++) {
		var mod = i % 2 === 0 ? sin3 : -sin3;
		ctx.strokeStyle = '#036';
		ctx.beginPath();
		ctx.bezierCurveTo(i * segmentWidth, middle,
							i*segmentWidth + segmentWidth/2, mod * height/4 + middle,
							(i+1) * segmentWidth, middle);
		ctx.stroke();
	}

	var numBeziers = 5;
	var segmentWidth = width / numBeziers;
	for(var i=0; i < numBeziers; i++) {
		var mod = i % 2 === 0 ? sin2 : -sin2;
		ctx.strokeStyle = '#0fc';
		ctx.beginPath();
		ctx.bezierCurveTo(i * segmentWidth, middle,
							i*segmentWidth + segmentWidth/2, mod * height/4 + middle,
							(i+1) * segmentWidth, middle);
		ctx.stroke();
	}

	var numBeziers = 2;
	var segmentWidth = width / numBeziers;
	for(var i=0; i < numBeziers; i++) {
		var mod = i % 2 === 0 ? sin3 : -sin3;
		ctx.strokeStyle = '#0fc';
		ctx.beginPath();
		ctx.bezierCurveTo(i * segmentWidth, middle,
							i*segmentWidth + segmentWidth/2, mod * height/4 + middle,
							(i+1) * segmentWidth, middle);
		ctx.stroke();
	}

	var numBeziers = 3;
	var segmentWidth = width / numBeziers;
	for(var i=0; i < numBeziers; i++) {
		var mod = (i % 2 === 0 ? sin0 : -sin0) + rand2/30;
		ctx.strokeStyle = '#0af';
		ctx.beginPath();
		ctx.bezierCurveTo(i * segmentWidth, middle,
							i*segmentWidth + segmentWidth/2, mod * height/4 + middle,
							(i+1) * segmentWidth, middle);
		ctx.stroke();
	}

	width = width_;
}