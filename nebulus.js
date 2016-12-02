(function () {
	'use strict';

	if (!window.requestAnimationFrame) {
		// thanks to Paul Irish <https://gist.github.com/mrdoob/838785>
		window.requestAnimationFrame = (function () {
			return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
					window.setTimeout( callback, 1000 / 60 );
				};
		})();
	}

	var colors = [
		'#fb2e01',
		'#6fcb9f',
		'#ffe28a',
		'#fffeb3'
	];
	for (var i = 0; i < 8; i++) {
		colors.push('#bbbbbb');
	}

	var canvas = document.querySelector('#bg');
	var updateBounds = function () {
		var bounds = document.body.getBoundingClientRect();
		canvas.width = bounds.width;
		canvas.height = bounds.height;
	};

	updateBounds();
	window.addEventListener('resize', updateBounds);

	var mouseRate = 0.06;
	var mouseX = canvas.width / 2;
	var toMouseX = canvas.width / 2;
	var mouseY = canvas.height / 2;
	var toMouseY = canvas.height / 2;
	document.body.addEventListener('mousemove', function (e) {
		toMouseX = e.clientX;
		toMouseY = e.clientY;
	}, {passive: true, capture: true});

	var ctx = canvas.getContext('2d');
	var speed = 300; // pixels per second for the 'deepest' layer
	var layers = 30;
	var threshold = 0.99;
	var layerBuf = [];
	var edge = 1500;
	var bakeSeconds = 15;
	var bakeMs = bakeSeconds * 1000;
	var textLayer = Math.floor(layers * 0.3);
	var comingSoon = "comingsoon";
	for (var i = 0; i < layers; i++) {
		layerBuf.push([]);
	}

	var lastTime = 0;

	var cb = function (time, baking) {
		if (!baking) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		if (!baking) {
			time += bakeMs;
		}

		var delta = time - lastTime;
		var deltaFrac = delta / 1000;
		lastTime = time;

		mouseX += (toMouseX - mouseX) * mouseRate;
		mouseY += (toMouseY - mouseY) * mouseRate;

		for (var i = 0; i < layers; i++) {
			var shift = (((i * speed) / 10) + speed) * deltaFrac;
			var yshift = ((mouseY / canvas.height) - 0.5) * shift * 15;
			var xshift = ((mouseX / canvas.width) - 0.5) * shift * 30;

			for (var p = 0, len = layerBuf[i].length; p < len;) {
				if (i === textLayer) {
					ctx.globalAlpha = 1.0;
					ctx.font = '32px monospace';
				}

				var part = layerBuf[i][p];
				if ((part[0] -= shift) < -edge) {
					layerBuf[i].shift();
					--len;
				} else {
					if (!baking) {
						ctx.fillStyle = part[2];
						if (i === textLayer) {
							part[4] = ((part[4] || 0) + (Math.round(Math.random() * 0.6))) % comingSoon.length;
							ctx.fillText(comingSoon[part[4]], (part[0] + xshift) - i, (part[1] + yshift) - i + yshift);
						} else {
							ctx.globalAlpha = part[3];
							ctx.fillRect((part[0] + xshift) - i, (part[1] + yshift) - i + yshift, i * 2 + 1, i * 2 + 1);
						}
					}
					++p;
				}
			}

			var spawn = Math.random();
			if (spawn < (threshold - Math.pow((layers - i) / layers, 15) * 1)) {
				continue;
			}

			for (var j = 0; j < Math.random() * 5; j++) {
				var y = Math.random() * (canvas.height + 300) - 150;
				layerBuf[i].push([canvas.width + edge, y, colors[Math.floor(Math.random() * colors.length)], 1 - (Math.pow(Math.random(), 2))]);
			}
		}

		ctx.fillStyle = 'rgb(30, 30, 30)';
		ctx.globalAlpha = 1;
		ctx.font = '180px Impact, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('BOLTERY', canvas.width / 2, canvas.height / 2);

		if (!baking) {
			window.requestAnimationFrame(cb);
		}
	};

	// prebake
	for (var i = 0; i < bakeMs; i += (1000 / 60)) {
		cb(i, true);
	}

	window.requestAnimationFrame(cb);
})();
