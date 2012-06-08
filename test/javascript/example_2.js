// Variables connected to the canvas
var canvasWidth = 750;
var canvasHeight = 400;
var curCol = "black";
var precEraser = "black";
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
var bg = new Image();
var record = new Array();
var precRecord = new Array();
var pages = new Array();
var curPage = 0;


    
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
	
	var reDo = document.getElementById('reDo_button');
	var unDo = document.getElementById('unDo_button');
	// var restore = document.getElementById('restore_button');
	var prec = document.getElementById('prec_button');
	var suc = document.getElementById('suc_button');
	
	
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

    var self = {
	

        init: function() {


			// Code for the image upload - BEGIN//
			var loadImageFile = (function(){

				if(window.FileReader) {
					var prevImg = null, fReader = new window.FileReader(),
					rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
					
					fReader.onload = function (e){

						self.loadNewImg(e.target.result);
						

					}

					return function(){
						var pict = document.getElementById("load").files;
						if(pict.length === 0 ){return;}
						if(!rFilter.test(pict[0].type)){
							alert("you must select a valid image file.");
							return;
						}
						
						fReader.readAsDataURL(pict[0]);
					}

				}

			})();
			
			window.onload = function(){
				document.getElementById("load").addEventListener("change", function(){
					if(this.value != ""){
						loadImageFile();
					}
				}, false);
			};
			// Code for the image upload - END//			
			
			
			// Appends the touch listeners to the canvas for the drawing operations
            canvas.addEventListener('touchstart', self.preDraw, false);
            canvas.addEventListener('touchmove', self.draw, false);
			//canvas.addEventListener('touchend', self.timer, false);			
			canvas.addEventListener('touchmove', self.position, false);
			
			// Appends the mouse listener to the canvas for the drawing operations
			canvas.addEventListener('mousemove', self.drawM, false);
			canvas.addEventListener('mouseup', self.stopDrawM, false);
			canvas.addEventListener('mouseout', self.stopDrawM, false);
			canvas.addEventListener('mousedown', self.preDrawM, false);
			
			
			// Appends the mouse listener to the various buttons of the toolbar
			
			//Clear button
			clearButton.addEventListener('mousedown' , self.clearCanvas, false);
			
			//Save button
			saveButton.addEventListener('mousedown' , self.saveCanvas, false);
			
			//Colors buttons
            blueColor.addEventListener('mousedown' , self.changeColor, false);
			blackColor.addEventListener('mousedown', self.changeColor, false);
			orangeColor.addEventListener('mousedown' , self.changeColor, false);
			redColor.addEventListener('mousedown', self.changeColor, false);
			greenColor.addEventListener('mousedown' , self.changeColor, false);
			yellowColor.addEventListener('mousedown', self.changeColor, false);
			whiteColor.addEventListener('mousedown' , self.changeColor, false);
			greyColor.addEventListener('mousedown', self.changeColor, false);
			brownColor.addEventListener('mousedown' , self.changeColor, false);
			
			reDo.addEventListener('mousedown' , self.reDo, false);
			unDo.addEventListener('mousedown' , self.unDoLine, false);
			// restore.addEventListener('mousedown' , self.reDraw, false);
			
			prec.addEventListener('mousedown', self.precPage, false);
			suc.addEventListener('mousedown', self.sucPage, false);
			
			
			//Sizes buttons
			sizeOne.addEventListener('mousedown', self.changeSize, false);
			sizeTwo.addEventListener('mousedown', self.changeSize, false);
			sizeThree.addEventListener('mousedown', self.changeSize, false);
			sizeFour.addEventListener('mousedown', self.changeSize, false);
			sizeFive.addEventListener('mousedown', self.changeSize, false);
			sizeSix.addEventListener('mousedown', self.changeSize, false);
			
			//Tools buttons
			pencilTool.addEventListener('mousedown', self.selectTool, false);
			eraserTool.addEventListener('mousedown', self.selectTool, false);
			//loadImg.addEventListener('mousedown', self.loadNewImg, false);
			
			
			
            
        },

		//Starts to prepare the drawing operation when the event 'touchstart' starts
        preDraw: function(event) {

			// Coordinates for calculate the offset of the object that contents the canvas
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;

            $.each(event.touches, function(i, touch) {
              
				// I take the identifier of a certain touch event to identify the touch line
                var id = touch.identifier; // This functions is used to make unique a certaint draw and to permit multidraw!
				idM++	
				// id_d.push(id); // I thake the ID of a touch line and record it in an array
                lines[id] = { x : this.pageX - posLeft , 
                              y : this.pageY - posTop , 
                              color : curCol
                           	};

							var curData = new Array;
							
							curData[0] = {id : idM, x : (this.pageX - posLeft), y : (this.pageY - posTop), color : curCol, size : lineW, time: new Date()};
							
							console.log((this.pageX - posLeft) + " = " + this.pageX);
							
							record.push(curData);
							
							self.copyArray();

				});

            event.preventDefault();
        },


		//This operation starts to thake the coordinates of the touch mooves and call the "move" function that draw the lines
        draw: function(event) {

			// Coordinates for calculate the offset of the object that contents the canvas
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
								
				var curData = new Array;
				
				curData[0] = {id : idM, x : lines[id].x, y : lines[id].y, color : curCol, size : lineW, time: new Date()};
				
				record.push(curData);
				
				precRecord.push(curData);
				

            });

            event.preventDefault();
        },

		//This is the real operation that draw the line
        move: function(i, changeX, changeY) {
            ctxt.strokeStyle = lines[i].color;
            ctxt.beginPath();
            ctxt.moveTo(lines[i].x, lines[i].y);


			var controlPointX = (lines[i].x + (lines[i].x+changeX)) / 2;
			var controlPointY = ((lines[i].y + (lines[i].y+changeY)) / 2);
			

			//ctxt.quadraticCurveTo(controlPointX, controlPointY,lines[i].x + changeX, lines[i].y + changeY);
			
            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
            ctxt.stroke();
            ctxt.closePath();

            return { x: lines[i].x + changeX, y: lines[i].y + changeY };
        },


		unDoLine: function(event){
			
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
			
			self.clearCanvas();
			
			for(i = 0; i < record.length; i++){
															
				console.log(record[i][0].id + " è uguale a " + idM);
										
				if((record[i][0].id == record[i+1][0].id) && (record[i][0].id != idM)){
										
					ctxt.strokeStyle = record[i][0].color;
					ctxt.lineWidth = record[i][0].size;
					ctxt.beginPath();
					ctxt.moveTo(record[i][0].x, record[i][0].y);
					ctxt.lineTo( record[i+1][0].x,  record[i+1][0].y);
					ctxt.stroke();
					ctxt.closePath();
										
				}
				
				
				if(record[i][0].id == idM){
				
				console.log("Eliminazione?");
				
				var numbers = record.length - i;
				
				record.splice(i,numbers);
								
				}
				
			}
						
			
		},

		reDo: function(event){
			
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
			
			console.log(precRecord.length + " - " + record.length);
			
			if(precRecord.length > record.length){
			
				self.clearCanvas();
				
				for(i = 0; i < precRecord.length; i++){
															
																				
					if(typeof(precRecord[i+1])!="undefined" && (precRecord[i][0].id == precRecord[i+1][0].id)){
										
						ctxt.strokeStyle = precRecord[i][0].color;
						ctxt.lineWidth = precRecord[i][0].size;
						ctxt.beginPath();
						ctxt.moveTo(precRecord[i][0].x, precRecord[i][0].y);
						ctxt.lineTo( precRecord[i+1][0].x,  precRecord[i+1][0].y);
						ctxt.stroke();
						ctxt.closePath();
										
					}
				
				}
				
				self.copyArray2();
				
			}	
					
			
		},
		
		copyArrayPro: function(first, second){
			
			second = new Array();
			
			for(i = 0; i < first.length; i++){
				
				second.push(first[i]);
				
			}
			
		},
		
		copyArray: function(event){
			
			
			precRecord = new Array();
			
			for(i = 0; i < record.length; i++){
				
				precRecord.push(record[i]);
				
			}
		},
			
		copyArray2: function(event){

			console.log("copiato");
			
			record = new Array();

			for(i = 0; i < precRecord.length; i++){

				record.push(precRecord[i]);

			}
		
		},

		// reDraw: function(event){
		// 			
		// 			var posLeft = this.offsetLeft;
		// 			var posTop = this.offsetTop;
		// 					
		// 			var i = 0;
		// 						
		// 			while(i<precRecord.length){
		// 													
		// 				if(typeof(precRecord[i+1])!="undefined" && precRecord[i][0].id == precRecord[i+1][0].id){
		// 										
		// 					ctxt.strokeStyle = precRecord[i][0].color;
		// 					ctxt.lineWidth = precRecord[i][0].size;
		// 					ctxt.beginPath();
		// 					ctxt.moveTo(precRecord[i][0].x, precRecord[i][0].y);
		// 					
		// 					if(typeof(precRecord[i+2])!="undefined" || precRecord[i][0].id == precRecord[i+2][0].id){
		// 						ctxt.quadraticCurveTo(precRecord[i+1][0].x,precRecord[i+1][0].y,precRecord[i+2][0].x, precRecord[i+2][0].y);
		// 						i = i + 2;				
		// 						
		// 					}else{
		// 						
		// 						ctxt.lineTo( precRecord[i+1][0].x,  precRecord[i+1][0].y);
		// 						i = i+1;
		// 						
		// 					}
		// 					ctxt.stroke();
		// 					ctxt.closePath();
		// 									
		// 				}
		// 				
		// 				if(typeof(precRecord[i+1])=="undefined"){i++;}
		// 				
		// 				
		// 			} 
		// 			
		// 		},
		
		
		reDraw: function(event){
							
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
			
			for(i = 0; i < record.length; i++){
					
				//console.log(record[i][0].id + " - " + record[i+1][0].id);
										
				if(typeof(precRecord[i+1])!="undefined" && record[i][0].id == record[i+1][0].id){
										
					ctxt.strokeStyle = record[i][0].color;
					ctxt.lineWidth = record[i][0].size;
					ctxt.beginPath();
					ctxt.moveTo(record[i][0].x, record[i][0].y);
					ctxt.lineTo( record[i+1][0].x,  record[i+1][0].y);
					ctxt.stroke();
					ctxt.closePath();
					
					lineW = record[i][0].size;
									
				}					
				
			} 
			
		},
		

		//Starts to prepare the drawing operation when the event 'touchstart' starts
		preDrawM: function(event) {

				//Variable that define the id of a certaint mouse event
				idM++;
				
				paint = true;
				
				lines[idM] = { x : event.pageX - this.offsetLeft , 
                              y : event.pageY - this.offsetTop , 
                              color : curCol
                           	};

				var curData = new Array;
							
				curData[0] = {id : idM, x : event.pageX - this.offsetLeft, y : event.pageY - this.offsetTop, color : curCol, size : lineW, time: new Date()}
							
				record.push(curData);
				
				self.copyArray();

			    event.preventDefault();
            
        },

		//This operation starts to thake the coordinates of the mouse mooves and call the "move" function that draw the lines
        drawM: function(event) {

				if (paint){

                moveX = event.pageX - this.offsetLeft - lines[idM].x ,
                moveY = event.pageY - this.offsetTop - lines[idM].y ;

				// I call the real draw operation
                var ret = self.move(idM, moveX, moveY);
                lines[idM].x = ret.x;
                lines[idM].y = ret.y;
				
				var curData = new Array;
				
				curData[0] = {id : idM, x : lines[idM].x, y : lines[idM].y, color : curCol, size : lineW, time: new Date()};
				
				record.push(curData);
				
				precRecord.push(curData);
				
				}
            event.preventDefault();
        },


		stopDrawM: function(event){
			
			paint = false;
			
			// for(i = 0; i < record.length; i++){
			// 				
			// 				console.log(record[i][0].id + " - " + record[i][0].color + " - " + record[i][0].size + " - " + record[i][0].x + " - " + record[i][0].y);
			// 				
			// 			}
			
		},

		
		// Function that shows the touch event position
		position: function(event) {
			
		   	var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
			
			 $.each(event.touches, function(i, touch) {
				
				curX = this.pageX - posLeft;
				curY = this.pageY - posTop;
				
				
			 });
			
		},

/*
		timer: function(i, touch){
			
				
					endTime = new Date();
			
		},

*/

		//Function that erase the content of the canvas
		clearCanvas: function(event){
			
			// if(this.id == 'clear_canv'){
			
						
				canvas.width = canvas.width;
				
				ctxt.lineWidth = lineW;
			
				ctxt.lineCap = lineStyle;
				
				ctxt.fillStyle = '#ffffff';
				
				ctxt.fillRect(0, 0, canvasWidth, canvasHeight);
				
				if(this.id == 'clear_canv'){
					
					record = new Array;
					console.log("Cleared the array");
					
				}
				
	    	// }

		},
		
		// Function that transform the canvas area into a png image shows in to a new browser page
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

						//curCol = "#CC0000";
						curCol = "red";
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
		loadNewImg: function(file){
			
			var image = new Image();
			
			image.src = file;
			
			image.onload = function(){
				
				ctxt.drawImage(image,0,0);
				
				document.getElementById("load").value = "";
							
				};
			
		}, 
		
		
		precPage: function(){
			
			if(curPage>0){
				
				var tempRecord = new Array();
				
				for(i = 0; i < record.length; i++){

					tempRecord.push(record[i]);

				}
								
				pages[curPage] = tempRecord;
								
				self.clearCanvas();
				
				record = new Array();
				
				precRecord = new Array();
				
				
				
				for(i = 0; i < (pages[curPage-1]).length; i++){

					record.push(pages[curPage-1][i]);
					
					precRecord.push(pages[curPage-1][i]);

				}
				
				
																		
				self.reDraw();
				
				curPage--;
				
			}
			
			
			
		},
		
		sucPage: function(){
			
			if(typeof(pages[curPage])=="undefined"){
				
				var tempRecord = new Array();
				
				for(i = 0; i < record.length; i++){

					tempRecord.push(record[i]);

				}
				
				pages.push(tempRecord);
								
				self.clearCanvas();
				
				precRecord = new Array();
								
				record = new Array();
								
				curPage++;
				
			}else{
				
				var tempRecord = new Array();
				
				for(i = 0; i < record.length; i++){

					tempRecord.push(record[i]);
					
				}
				
				pages[curPage] = tempRecord
				
				if(typeof(pages[curPage+1])=="undefined"){
					
					self.clearCanvas();

					record  = new Array;

					precRecord = new Array;

					curPage++;
										
				}else{
					
					self.clearCanvas();
					
					
					precRecord = new Array();
					
					record = new Array();
					
					for(i = 0; i < (pages[curPage+1]).length; i++){

						record.push(pages[curPage+1][i]);
						
						precRecord.push(pages[curPage+1][i]);

					}
					
					
					self.reDraw();
					
					
					curPage++;
										
				}
				
			}
			
		},
		

    };

    return self.init();

};


$(function(){
  var start = new CanvasDrawr({id:"example"}); 
});