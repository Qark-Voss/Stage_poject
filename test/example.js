
// We don't use this type of element to prepare a canvas for HTML5 because some browsers (IE) doesn't support it
//context = document.getElementById('canvasDiv').getContext("2d");


var canvasWidth = 500;
var canvasHeight = 500;

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint = false;


function prepareCanvas() {

	var canvasDiv = document.getElementById('canvasDiv');

	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);

	if(typeof G_vmlCanvasManager != 'undefined') {
	
		canvas = G_vmlCanvasManager.initElement(canvas);
	
	}

	context  = canvas.getContext("2d");


	// This funciont allow us to record the position of the mouse in an array (addClick function). We set then the boolean paint to true 
	// and finally we update the canvas with the redraw() function

	$('#canvas').mousedown(function (e) {
	
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
	
		paint  = true;
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		redraw();
	
	});


	// Mouse move event allow us to know if the user is pressing down and we do this with the boolean variable "paint". If it's true
	// we record the value and update.

	$('#canvas').mousemove(function(e) {
	
		if(paint){
			addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
		}
	
	});


	// The mouse is off the paper

	$('#canvas').mouseup(function(e){
	
		paint = false;
	
	});


	// If the mouse goes out of the paper the paint variable is set on false

	$('#canvas').mouseleave(function(e){
	
		paint = false;
	
	});
}

// This function save the click position

function addClick(x, y, dragging){
	
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
	
}


function redraw(){
	
	canvas.width = canvas.width; // Clear the canvas
	
	context.strokeStyle = "#df4b26";
	context.lineJoin = "round";
	context.lineWidth = 5;
	
	for (var i = 0; i < clickX.lenght; i++){
		
		context.beginPath();
		if(clickDrag[i] && i){
			context.moveTo(clickX[i-1], clickY[i+1]);
		}else{
			context.moveTo(click[i]-1, clickY[i]);
		}
		
		context.lineTo(click[i], clickY[i]);
		context.closePath();
		context.stroke;
		
	}
	
}
