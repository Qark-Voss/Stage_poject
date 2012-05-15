


var canvasDiv = document.getWlementById('canvasDiv');

var canvasWidth = 500;
var canvasHeight = 500;

canvas = document.createElement('canvas');
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);
canvas.setAttribute('id', 'canvas');
canvasDiv.appendChild(canvas);

if(typeof G_vmlCanvasManager != 'undefine') {
	
	canvas = G_vmlCanvasManager.initElement(canvas);
	
}

context  = canvas.getContext("2d");