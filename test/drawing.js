
// We don't use this type of element to prepare a canvas for HTML5 because some browsers (IE) doesn't support it
//context = document.getElementById('canvasDiv').getContext("2d");

var canvas;

var canvasWidth = 500;
var canvasHeight = 250;

var canvasSize = 15;
var curColor = "red";

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var timeD = new Array();
var numReg = 0;
var paint = false;
var startTime;
var endTime;


function prepareCanvas() {


	var CanvasDrawr = function(options) {



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

		context.lineWidth = canvasSize;
		context.lineCap = "round";
		
		context.pX = undefined;
		context.pY = undefined;

		var lines = [,,];
		var offset = $(canvas).offset();
	
		var self = {
	
			init: function(){
				
				canvas.addEventListener('touchstart', self.preDraw, false);
				canvas.addEventListener('touchmove', selv.draw, false);
				
			},
			
			
			preDraw: function(event) {
				
				$.each(event.touches, function(i, touch) {
					
					var id = touch.identifier;
					
					lines[id] = { x : this.pageX - offset.left, y : this.pageY - offset.top, color : curColor
						
					};
					
					
				});
				
				
			event.preventDefault();
				
			},
		
		
			draw: function(event){
				
				var e = event, hmm = {};
				
				$.each(event.touches, function(i, touch){
					
					var id = touch.identifier;
					var moveX = this.pageX - offset.left - lines[id].x;
					var moveY = this.pageY - offset.top - lines[id].y;
					
					var ret = self.move(id, moveX, moveY);
					lines[id].x = ret.x;
					lines[id].y = ret.y;
					
					
				});
				
				event.preventDefault();
				
			},
			
			move: function(i, changeX, changeY) {
				
				context.strokeStyle = lines[i].color;
				context.beginPath();
				context.moveTo(lines[i].x, line[i].y);
				
				context.lineTo(lines[i].x + changeX, lines[i].y + changeY);
				context.stroke();
				context.closePath();
				
				return {x: lines[i].x + changeX, y: lines[i].y + changeY};
				
			}
			
		
		};

		return self.init();

	};
	
}


