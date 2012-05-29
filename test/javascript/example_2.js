var canvasWidth = 750;
var canvasHeight = 400;
var curCol = "red";
var precEraser = "red";
var lineW = 2;
var lineStyle = "round";
var img = new Image();
var startTime;
var endTime;
var curX = 0;
var curY = 0;
//var timeD = new Array();
//var id_d = new Array();
var idM = 0;
var paint;
var	pathB = 'img/background.jpg';
var bg = new Image();
bg.src = pathB;


    
var CanvasDrawr = function(options) {

	var cont = document.getElementById('starships')
    var canvasDiv = document.getElementById('canvasDiv'); // I'm importing the canvasDiv
	var clearButton = document.getElementById('clear_canv'); // I'm getting the clear_canv button
	var saveButton = document.getElementById('save_canv'); // I'm getting the save_canv button
	
	// Getting the tools
	var pencilTool = document.getElementById('pencil');
	var eraserTool = document.getElementById('eraser');
	
	// Getting the button to change color
	var blueColor = document.getElementById('blue_b');
	var blackColor = document.getElementById('black_b');
	var greenColor = document.getElementById('green_b');
	var redColor = document.getElementById('red_b');
	var orangeColor = document.getElementById('orange_b');
	var whiteColor = document.getElementById('white_b');
	var greyColor = document.getElementById('grey_b');
	var brownColor = document.getElementById('brown_b');
	var yellowColor = document.getElementById('yellow_b');
	
	// Getting button to change size
	var sizeOne = document.getElementById('one');
	var sizeTwo = document.getElementById('two');
	var sizeThree = document.getElementById('three');
	var sizeFour = document.getElementById('four');
	var sizeFive = document.getElementById('five');
	var sizeSix = document.getElementById('six');
	
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

	// Setting the canvas style
    ctxt.lineWidth = lineW;
    ctxt.lineCap = lineStyle;
	ctxt.fillStyle = "#ffffff"
	ctxt.fillRect(0, 0, canvasWidth, canvasHeight);

	// Define the array of value: lines is an array with 3 records for each row
    var lines = [,,];
    var offset = $(canvas).offset();

    var self = {
	

	
        init: function() {
            canvas.addEventListener('touchstart', self.preDraw, false);
            canvas.addEventListener('touchmove', self.draw, false);
			//canvas.addEventListener('touchend', self.timer, false);
			
			// I Define the listener to the mouse events
			canvas.addEventListener('touchmove', self.position, false);
			canvas.addEventListener('mousemove', self.drawM, false);
			canvas.addEventListener('mouseup', self.stopDrawM, false);
			canvas.addEventListener('mouseout', self.stopDrawM, false);
			
			canvas.addEventListener('mousedown', self.preDrawM, false)
			
			clearButton.addEventListener('mousedown' , self.clearCanvas, false);
			saveButton.addEventListener('mousedown' , self.saveCanvas, false);
			
            blueColor.addEventListener('mousedown' , self.changeColor, false);
			blackColor.addEventListener('mousedown', self.changeColor, false);
			orangeColor.addEventListener('mousedown' , self.changeColor, false);
			redColor.addEventListener('mousedown', self.changeColor, false);
			greenColor.addEventListener('mousedown' , self.changeColor, false);
			yellowColor.addEventListener('mousedown', self.changeColor, false);
			whiteColor.addEventListener('mousedown' , self.changeColor, false);
			greyColor.addEventListener('mousedown', self.changeColor, false);
			brownColor.addEventListener('mousedown' , self.changeColor, false);
			
			sizeOne.addEventListener('mousedown', self.changeSize, false);
			sizeTwo.addEventListener('mousedown', self.changeSize, false);
			sizeThree.addEventListener('mousedown', self.changeSize, false);
			sizeFour.addEventListener('mousedown', self.changeSize, false);
			sizeFive.addEventListener('mousedown', self.changeSize, false);
			sizeSix.addEventListener('mousedown', self.changeSize, false);
			
			pencilTool.addEventListener('mousedown', self.selectTool, false);
			eraserTool.addEventListener('mousedown', self.selectTool, false);
			loadImg.addEventListener('mousedown', self.loadNewImg, false);
			
            
        },

		//I start to prepare the drawing operation when the event 'touchstart' starts
        preDraw: function(event) {


			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
			

            $.each(event.touches, function(i, touch) {
              

				// I take the identifier of a certain touch event to identify the touch line
                var id = touch.identifier; // This functions is used to make unique a certaint draw and to permit multidraw!

				// id_d.push(id); // I thake the ID of a touch line and record it in an array
                lines[id] = { x : this.pageX - posLeft , 
                              y : this.pageY - posTop , 
                              color : curCol
                           	};

							console.log(this.pageX + " !-! " + this.pageY);
							console.log(id);

				});

            event.preventDefault();
        },


		//This operation start to draw the lines when i execute a touch operation on the touchscreen
        draw: function(event) {

			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;

            $.each(event.touches, function(i, touch) {
                var id = touch.identifier,
                    moveX = this.pageX - posLeft - lines[id].x ,
                    moveY = this.pageY - posTop - lines[id].y ;

				// I call the real draw operation
                var ret = self.move(id, moveX, moveY);
                lines[id].x = ret.x;
                lines[id].y = ret.y;
								
				//console.log(this.pageX + " - " + this.pageY);
								
				//console.log(id_d[0]);// i check the ID of the touch line

            });

            event.preventDefault();
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


		preDrawM: function(event) {

				
				idM++;
				
				paint = true;
				
				lines[idM] = { x : event.pageX - this.offsetLeft , 
                              y : event.pageY - this.offsetTop , 
                              color : curCol
                           	};

			    event.preventDefault();
				console.log(idM);
            
        },

		//This operation start to draw the lines when i execute a touch operation on the touchscreen
        drawM: function(event) {

				if (paint){

                moveX = event.pageX - this.offsetLeft - lines[idM].x ,
                moveY = event.pageY - this.offsetTop - lines[idM].y ;

				// I call the real draw operation
                var ret = self.move(idM, moveX, moveY);
                lines[idM].x = ret.x;
                lines[idM].y = ret.y;
								
				//console.log(this.pageX + " - " + this.pageY);
								
				//console.log(id_d[0]);// i check the ID of the touch line
				}
            event.preventDefault();
        },


		stopDrawM: function(event){
			
			paint = false;
			
		},

		//This is the real operation that draw the line

		position: function(event) {
			
			 $.each(event.touches, function(i, touch) {
				
				curX = this.pageX - offset.left;
				curY = this.pageY - offset.top;
				
				
			 });
			
		},

/*
		timer: function(i, touch){
			
				
					endTime = new Date();
			
		},

*/

		//Function that erase the content of the canvas
		clearCanvas: function(event){
			
			if(this.id == 'clear_canv'){
			
						
				canvas.width = canvas.width;
				
				ctxt.lineWidth = lineW;
			
				ctxt.lineCap = lineStyle;
				
				ctxt.fillStyle = '#ffffff';
				
				ctxt.fillRect(0, 0, canvasWidth, canvasHeight);
				
	    	}

		},
		
		
		saveCanvas: function(event){
			
			if(this.id == 'save_canv'){
			
				var img = canvas.toDataURL("image/png");
												
				window.open(img);
				
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
						
			if(this.id == 'blue_b'){
				
				curCol = "#3366CC";
				precEraser = curCol;
				
				
			}
			
			if(this.id=='black_b'){
				curCol = 'black';
				precEraser = curCol;
			}
			
				if(this.id == 'orange_b'){

					curCol = "#FF6600";
					precEraser = curCol;


				}

				if(this.id=='green_b'){
					curCol = '#00CC00';
					precEraser = curCol;
				}
				
					if(this.id == 'red_b'){

						curCol = "#CC0000";
						precEraser = curCol;


					}

					if(this.id=='white_b'){
						curCol = '#FFFFFF';
						precEraser = curCol;
					}
					
						if(this.id == 'grey_b'){

							curCol = "#808080";
							precEraser = curCol;


						}

						if(this.id=='yellow_b'){
							curCol = '#FFCC00';
							precEraser = curCol;
						}
						
							if(this.id == 'brown_b'){

								curCol = "#85541C";
								precEraser = curCol;


							}

			
		},
		
		//Function that allows to change the size of the line
		changeSize: function(event){
			
			if(this.id == 'one'){
				
				lineW = 1;
				
				ctxt.lineWidth = lineW;
				
			}
			
			if(this.id == 'two'){
					
					lineW = 2;
					
					ctxt.lineWidth = lineW;
					
			}
				
			if(this.id == 'three'){
						
					lineW = 5;
						
					ctxt.lineWidth = lineW;
						
			}
					
			if(this.id == 'four'){
						
					lineW = 7;
						
					ctxt.lineWidth = lineW;
						
			}
			
			if(this.id == 'five'){
						
					lineW = 11;
						
					ctxt.lineWidth = lineW;
						
			}
			
			if(this.id == 'six'){
						
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