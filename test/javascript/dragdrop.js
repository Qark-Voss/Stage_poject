

var testEl;

window.onload = function () {
	testEl = $('testElement');
	testEl.onmousedown = testEl.ontouchstart = startDrag;

	// don't try to remove the mousedown ontouchstart; it makes the first drag
	// very slow.

}

function startDrag(e) {

	if (e.type === 'touchstart') {
		testEl.onmousedown = null;
		testEl.ontouchmove = moveDrag;
		testEl.ontouchend = function () {
			testEl.ontouchmove = null;
			testEl.ontouchend = null;
			testEl.ontouchstart = startDrag; // necessary for Dolfin; this is a bug
		}
	} else {
		document.onmousemove = moveDrag;
		document.onmouseup = function () {
			document.onmousemove = null;
			document.onmouseup = null;
		}
	}

	var pos = [testEl.offsetLeft,testEl.offsetTop];
	var origin = getCoors(e);


	function moveDrag (e) {
		var currentPos = getCoors(e);
		var deltaX = currentPos[0] - origin[0];
		var deltaY = currentPos[1] - origin[1];
		testEl.style.left = (pos[0] + deltaX) + 'px';
		testEl.style.top  = (pos[1] + deltaY) + 'px';
		return false;
		/* cancels scrolling; Android 2.1 needs this ontouchstart, but that's a bug.
		iPhone and Android 2.2 allow it ontouchstart, but also ontouchmove
		Dolfin requires it ontouchmove */
	}

	function getCoors(e) {
		var coors = [];
		if (e.touches && e.touches.length) { 
			coors[0] = e.touches[0].clientX;
			coors[1] = e.touches[0].clientY;
		} else {
			coors[0] = e.clientX;
			coors[1] = e.clientY;
		}
		return coors;
	}
}

function $(id) {
	return document.getElementById(id);
}



