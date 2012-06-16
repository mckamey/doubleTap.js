/**
 * Unifies click and dblclick events between desktop and touch as tap and dbltap.
 * Copyright (c)2012 Stephen M. McKamey.
 * Licensed under The MIT License.
 * 
 * @param {Object} elem The DOM element to polyfill (required)
 * @param {number} speed max delay between multi-clicks in milliseconds (optional, default: 500ms)
 * @param {number} distance max distance between multi-clicks in pixels (optional, default: 40px)
 */
var doubleTap = function(elem, speed, distance) {
	'use strict';

	if (!elem || !elem.tagName) {
		return;
	}

	// default dblclick speed to half sec (Windows & Mac OS X default)
	speed = Math.abs(+speed) || 500;//ms
	// default dblclick distance to within 40x40 pixel area
	distance = Math.abs(+distance) || 40;//px

	var taps, x, y,
		series,
		reset = function() {
			// reset series
			taps = 0;
			x = NaN;
			y = NaN;
		};

	reset();

	if ('ontouchstart' in elem) {
		// handle via touch events
		elem.addEventListener('touchstart', function(e) {
			if (series) {
				clearTimeout(series);
			}
			series = setTimeout(reset, speed);
		}, false);

		elem.addEventListener('touchmove', function(e) {
			reset();
		}, false);

		elem.addEventListener('touchend', function(e) {
			// kill when multi-touch
			if (e.changedTouches.length !== 1) {
				reset();
				return;
			}
	
			var touch = e.changedTouches[0],
				oldX = x,
				oldY = y,
				e2;
	
			taps++;
			x = +touch.clientX || +touch.pageX || +touch.screenX;
			y = +touch.clientY || +touch.pageY || +touch.screenY;
	
			// fire tap event
			e2 = document.createEvent('MouseEvents');
			if (e2.initMouseEvent) {
				e2.initMouseEvent(
					'tap',
					true,			// click bubbles
					true,			// click cancelable
					e.view,			// copy view
					taps,			// click count
					touch.screenX,	// copy coordinates
					touch.screenY,
					touch.clientX,
					touch.clientY,
					e.ctrlKey,		// copy key modifiers
					e.altKey,
					e.shiftKey,
					e.metaKey,
					e.button,		// copy button 0: left, 1: middle, 2: right
					touch.target);	// copy target
			}
			elem.dispatchEvent(e2);
	
			if (taps === 2 &&
				// NaN will always test false
				Math.abs(oldX-x) < distance &&
				Math.abs(oldY-y) < distance) {
	
				// fire dbltap event only for 2nd click
				e2 = document.createEvent('MouseEvents');
				if (e2.initMouseEvent) {
					e2.initMouseEvent(
						'dbltap',
						true,			// dblclick bubbles
						true,			// dblclick cancelable
						e.view,			// copy view
						taps,			// click count
						touch.screenX,	// copy coordinates
						touch.screenY,
						touch.clientX,
						touch.clientY,
						e.ctrlKey,		// copy key modifiers
						e.altKey,
						e.shiftKey,
						e.metaKey,
						e.button,		// copy button 0: left, 1: middle, 2: right
						touch.target);	// copy target
				}
				elem.dispatchEvent(e2);
			}
		}, false);

	} else {
		// non-touch has fully functional native click
		var onclick = function(e) {
			var oldX = x,
				oldY = y,
				e2;
	
			x = +e.clientX || +e.pageX || +e.screenX;
			y = +e.clientY || +e.pageY || +e.screenY;

			// fire tap event
			e2 = document.createEvent('MouseEvents');
			if (e2.initMouseEvent) {
				e2.initMouseEvent(
					'tap',
					true,		// click bubbles
					true,		// click cancelable
					e.view,		// copy view
					e.detail,	// click count
					e.screenX,	// copy coordinates
					e.screenY,
					e.clientX,
					e.clientY,
					e.ctrlKey,	// copy key modifiers
					e.altKey,
					e.shiftKey,
					e.metaKey,
					e.button,	// copy button 0: left, 1: middle, 2: right
					e.target);	// copy target
			}
			elem.dispatchEvent(e2);

			if (e.detail === 2 &&
				// NaN will always test false
				Math.abs(oldX-x) < distance &&
				Math.abs(oldY-y) < distance) {

				// fire dbltap event only for 2nd click
				e2 = document.createEvent('MouseEvents');
				if (e2.initMouseEvent) {
					e2.initMouseEvent(
						'dbltap',
						true,		// dblclick bubbles
						true,		// dblclick cancelable
						e.view,		// copy view
						e.detail,	// click count
						e.screenX,	// copy coordinates
						e.screenY,
						e.clientX,
						e.clientY,
						e.ctrlKey,	// copy key modifiers
						e.altKey,
						e.shiftKey,
						e.metaKey,
						e.button,	// copy button 0: left, 1: middle, 2: right
						e.target);	// copy target
				}
				elem.dispatchEvent(e2);
			}
		};

		if (elem.addEventListener) {
			// DOM Level 2
			elem.addEventListener('click', onclick, false);
		} else {
			// DOM Level 0
			elem.onclick = onclick;
		}
	}
};
