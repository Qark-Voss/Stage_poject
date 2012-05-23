
var canvasWidth = 500;
var canvasHeight = 500;
var curCol = "red";
var precEraser = "red";
var lineW = 1;
var lineStyle = "round";
var img = new Image();
var startTime;
var endTime;
var curX = 0;
var curY = 0;
//var timeD = new Array();
//var id_d = new Array();

    
var CanvasDrawr = function(options) {

	
    var canvasDiv = document.getElementById('canvasDiv'); // I'm importing the canvasDiv
	var clearButton = document.getElementById('clear_canv'); // I'm getting the clear_canv button
	
	// Getting the tools
	var pencilTool = document.getElementById('pencil');
	var eraserTool = document.getElementById('eraser');
	
	// Getting the button to change color
	var purpleColor = document.getElementById('purple_b');
	var blackColor = document.getElementById('black_b');
	
	// Getting button to change size
	var sizeSmall = document.getElementById('small');
	var sizeMedium = document.getElementById('medium');
	var sizeBig = document.getElementById('big');
	
	// Getting the button to load images
	var loadImg = document.getElementById('load');
	
	// Creating a new element for teh HTML page: canvas
	var canvas = document.createElement('canvas');
	
	// Appending to the HTML file the new element
	canvasDiv.appendChild(canvas);
	
	
	
	if(typeof G_vmlCanvasManager != 'undefined') {
	
		canvas = G_vmlCanvasManager.initElement(canvas);
	
	}

    ctxt = canvas.getContext("2d");
    
    // Setting the canvas sizes
    canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
    canvas.width = canvas.offsetWidth;
    canvas.style.width = '';

	// Setting the canvas style
    ctxt.lineWidth = lineW;
    ctxt.lineCap = lineStyle;
    ctxt.pX = undefined;
    ctxt.pY = undefined;


	// Define the array of value: lines is an array with 3 records for each row
    var lines = [,,];
    var offset = $(canvas).offset();

    var self = {
	

	
        init: function() {
            //set pX and pY from first click
			
            canvas.addEventListener('touchstart', self.preDraw, false);
            canvas.addEventListener('touchmove', self.draw, false);
			//canvas.addEventListener('touchend', self.timer, false);
			canvas.addEventListener('touchmove', self.position, false);
			
			clearButton.addEventListener('mousedown' , self.clearCanvas, false);
            purpleColor.addEventListener('mousedown' , self.changeColor, false);
			blackColor.addEventListener('mousedown', self.changeColor, false);
			sizeSmall.addEventListener('mousedown', self.changeSize, false);
			sizeMedium.addEventListener('mousedown', self.changeSize, false);
			sizeBig.addEventListener('mousedown', self.changeSize, false);
			pencilTool.addEventListener('mousedown', self.selectTool, false);
			eraserTool.addEventListener('mousedown', self.selectTool, false);
			loadImg.addEventListener('mousedown', self.loadNewImg, false);
			
            
        },

		//I start to prepare the drawing operation when the event 'touchstart' starts
        preDraw: function(event) {


            $.each(event.touches, function(i, touch) {
              

				// I take the identifier of a certain touch event to identify the touch line
                var id = touch.identifier;

				// id_d.push(id); // I thake the ID of a touch line and record it in an array
                lines[id] = { x : this.pageX - offset.left, 
                              y : this.pageY - offset.top, 
                              color : curCol
                           	};

				});

            event.preventDefault();
        },

		//This operation start to draw the lines when i execute a touch operation on the touchscreen
        draw: function(event) {

            $.each(event.touches, function(i, touch) {
                var id = touch.identifier,
                    moveX = this.pageX - offset.left - lines[id].x,
                    moveY = this.pageY - offset.top - lines[id].y;

				// I call the real draw operation
                var ret = self.move(id, moveX, moveY);
                lines[id].x = ret.x;
                lines[id].y = ret.y;
								
				//console.log(id_d[0]);// i check the ID of the touch line

            });

            event.preventDefault();
        },


		position: function(event) {
			
			 $.each(event.touches, function(i, touch) {
				
				curX = this.pageX - offset.left;
				curY = this.pageY - offset.top;
				
				console.log(curX + curY);
				
			 });
			
		},
		

		//This is the real operation that draw the line
        move: function(i, changeX, changeY) {
            ctxt.strokeStyle = lines[i].color;
            ctxt.beginPath();
            ctxt.moveTo(lines[i].x, lines[i].y);

            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
            ctxt.stroke();
            ctxt.closePath();

            return { x: lines[i].x + changeX, y: lines[i].y + changeY };
        },

/*
		timer: function(i, touch){
			
				
					endTime = new Date();
			
		},

*/

		//Function that erase the content of the canvas
		clearCanvas: function(event){
			
			if(this.id == 'clear_canv'){
			
				ctxt.fillStyle = '#ffffff';
				ctxt.fillRect(0, 0, canvasWidth, canvasHeight);
						
				canvas.width = canvas.width;

				ctxt.lineWidth = lineW;
			
				ctxt.lineCap = lineStyle;
	    	}

		},
		
		
		//Function that allows to select different tools
		selectTool: function(event){
			
			if(this.id == 'pencil'){
				
				curCol = precEraser;
				
			}
			
			if(this.id == 'eraser'){
				
				precErase = curCol;
				curCol = 'white';
				
			}
			
		},
		
		
		//Function that allows to change color of the line
		changeColor: function(event){
						
			if(this.id == 'purple_b'){
				
				curCol = "purple";
				precEraser = curCol;
				
				
			}
			
			if(this.id=='black_b'){
				curCol = 'black';
				precEraser = curCol;
			}
			
		},
		
		//Function that allows to change the size of the line
		changeSize: function(event){
			
			if(this.id == 'small'){
				
				lineW = 1;
				
				ctxt.lineWidth = lineW;
				
			}
			
			if(this.id == 'medium'){
					
					lineW = 5;
					
					ctxt.lineWidth = lineW;
					
			}
				
			if(this.id == 'big'){
						
					lineW = 15;
						
					ctxt.lineWidth = lineW;
						
			}
					
				
			
		},
		
		//Function that allows to load images and put them in the background of the canvas
		loadNewImg: function(event){
							
			var	path = 'img/keroro.jpg';
			img.src = path;
			ctxt.drawImage(img,50,50);
			
		},
		
		

    };

    return self.init();

};


$(function(){
  var start = new CanvasDrawr({id:"example"}); 
});