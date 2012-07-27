// Variables connected to the canvas
var canvasWidth = 1100;
var canvasHeight = 550;

// var canvasWidth = 300;
// var canvasHeight = 400;

var curCol = "black";
var precEraser = "black";
var lineW = 2;
var lineStyle = "round";
var img = "undefined";

var startTime;
var endTime;

var curX = 0;
var curY = 0;

//var timeD = new Array();
//var id_d = new Array();

var idM = 0;
var idA = 0;

var paint;
var bg = new Image();

var record = new Array();
var precRecord = new Array();
var imageRecord = new Array();
var pages = new Array();
var curPage = 0;


// Variabili per la registrazione audio

var audioRec = new Array();
var mediaRec;
var currentReg = "undefined";
var timerPage = new Array();
var recording = false;

// Variabili per la colorazione del tratto sincronizzato con l'audio

var queue = new Array();
var curX = 0;
var curC = 0;
var curW = 0;


    
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
	
	// Getting butto for media player
	var rec = document.getElementById('record_button');
	var stop = document.getElementById('stopRec_button');
	// var play = document.getElementById('play_button');
	var playD = document.getElementById('play_draw');
	var media_pl = document.getElementById('media');
	
	// Navigating menu and 
	var reDo = document.getElementById('reDo_button');
	var unDo = document.getElementById('unDo_button');
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
			
			rec.addEventListener('mousedown', self.recordAudioStart, false);
			stop.addEventListener('mousedown', self.recordAudioStop, false);
			// play.addEventListener('mousedown', self.playAudio, false);
			playD.addEventListener('mousedown', self.playAudioDraw, false);
			media_pl.addEventListener('change', self.setCurReg, false);
			
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
			loadImg.addEventListener('mousedown', self.loadNewImg, false);			
			
            
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
							
							var drawTime = new Array;
		
							
							curData[0] = {id : idM, x : (this.pageX - posLeft), y : (this.pageY - posTop), color : curCol, size : lineW, time: new Date(), audio: currentReg};
							
							drawTime[0] = {idL : idM, startDraw: new Date(), stopDraw: "undefined", page: curPage, audio: currentReg, erased: false};
							
							// console.log((this.pageX - posLeft) + " = " + this.pageX);
							
							timerPage.push(drawTime);
							
							timerPage[timerPage.length - 1][0].stopDraw = timerPage[timerPage.length - 1][0].startDraw;
														
							record.push(curData);
							
							self.copyArray();
							
							var jsonData = JSON.stringify(record);
							 									
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
				
				curData[0] = {id : idM, x : lines[id].x, y : lines[id].y, color : curCol, size : lineW, time: new Date(), audio: currentReg};
				
				timerPage[timerPage.length - 1][0].stopDraw = new Date();
				
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


			// var controlPointX = (lines[i].x + (lines[i].x+changeX)) / 2;
			// var controlPointY = ((lines[i].y + (lines[i].y+changeY)) / 2);
			// 
			//ctxt.quadraticCurveTo(controlPointX, controlPointY,lines[i].x + changeX, lines[i].y + changeY);
			
            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
            ctxt.stroke();
            ctxt.closePath();

            return { x: lines[i].x + changeX, y: lines[i].y + changeY };
        },


		unDoLine: function(event){
			
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
	
	
			if(img != "undefined"){	
								
				var image = new Image();
				image.src = img;

				self.clearCanvas();
				
				image.onload = function(){

					ctxt.drawImage(image, 0, 0);
			
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
				}		
			}else {
				
				self.clearCanvas();
				
				for(i = 0; i < record.length; i++){
						
					// Aggiustare l'if mi raccomando! 																			
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
						
					var numbers = record.length - i;
			
					record.splice(i,numbers);
					
					timerPage[timerPage.length - 1][0].erased = true;
							
					}
			
				}
				
			}
		},

		reDo: function(event){
			
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
						
			if(precRecord.length > record.length){
			
					if(img != "undefined"){	

						var image = new Image();
						image.src = img;

						self.clearCanvas();

						image.onload = function(){

						ctxt.drawImage(image, 0, 0);
					
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
				
					}else{
						
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
					
					timerPage[timerPage.length - 1][0].erased = false;
					
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
			
			record = new Array();

			for(i = 0; i < precRecord.length; i++){

				record.push(precRecord[i]);

			}
		
		},
		
		
		reDraw: function(event){
							
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
			
			for(i = 0; i < record.length; i++){
															
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
							
				curData[0] = {id : idM, x : event.pageX - this.offsetLeft, y : event.pageY - this.offsetTop, color : curCol, size : lineW, time: new Date(), audio: currentReg}
							
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
				
				curData[0] = {id : idM, x : lines[idM].x, y : lines[idM].y, color : curCol, size : lineW, time: new Date(), audio: currentReg};
				
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


		//Function that erase the content of the canvas
		clearCanvas: function(event){
			
						
				canvas.width = canvas.width;
				
				ctxt.lineWidth = lineW;
			
				ctxt.lineCap = lineStyle;
				
				ctxt.fillStyle = '#ffffff';
				
				ctxt.fillRect(0, 0, canvasWidth, canvasHeight);
								
				if(this.id == 'clear_canv'){
					
					record = new Array;
					img = "undefined";
					
				}
				
		},
		
		// Function that transform the canvas area into a png image shows in to a new browser page
		// saveCanvas: function(event){
		// 			
		// 			if(this.id == 'save_canv'){
		// 			
		// 				var img = canvas.toDataURL("image/png");
		// 												
		// 				window.open(img);
		// 				
		// 	    	}
		// 
		// 		},
		
		
		saveCanvas: function(event){
					
			console.log("TEST SCRITTURA");		
									
			// Salvataggio in stringa dell'array via JSON
			var jsonData1 = JSON.stringify(audioRec);			
			var jsonData2 = JSON.stringify(timerPage);
			var jsonData2 = JSON.stringify(record);

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
				console.log(curCol);
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
		// loadNewImg: function(file){
		// 	
		// 	var image = new Image();
		// 	
		// 	image.src = file;
		// 	
		// 	image.onload = function(){
		// 		
		// 		ctxt.drawImage(image,0,0);
		// 		
		// 		document.getElementById("load").value = "";
		// 					
		// 		};
		// 	
		// }, 
		
		
		loadNewImg: function(event){
					
			console.log("TEST SCRITTURA");		
			
			navigator.camera.getPicture(self.onPhotoURISuccess, self.onFail, { quality: 50, 
		    destinationType: navigator.camera.DestinationType.FILE_URI,
		    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
			
		},
		
		onPhotoURISuccess: function(imageURI) {
				
			console.log("andata");
			
			
			var image = new Image();
			image.src = imageURI;

			self.clearCanvas();

			record = new Array();
			
			precRecord = new Array();

			image.onload = function(){
			  	ctxt.drawImage(image,0,0, canvasWidth, canvasHeight);
			  	var dataURL=canvas.toDataURL("image/png");
		   		img=dataURL;
			}
				
		}, 
		
		onFail: function(message) {
		      alert('Failed because: ' + message);
		},
		
		
		precPage: function(){
			
			// Check if this is the first page or not
			if(curPage>0){
				
				// It is not the first page
				if(recording == true){
					self.recordAudioStop();
				}

				var x = document.getElementById("media");

		        document.getElementById("media_list").removeChild(x);

				var select = document.createElement("select");
		        select.setAttribute("id", "media");
				document.getElementById("media_list").appendChild(select);

				media_pl = document.getElementById('media');

				currentReg = "undefined";
				
				
				var tempRecord = new Array();
				
				for(i = 0; i < record.length; i++){

					tempRecord.push(record[i]);

				}
								
				pages[curPage] = tempRecord;
												
				record = new Array();
				
				precRecord = new Array();
				
				
				
				for(i = 0; i < (pages[curPage-1]).length; i++){

					record.push(pages[curPage-1][i]);
					precRecord.push(pages[curPage-1][i]);

				}
				
				// Check if there is a background image
				if(typeof(imageRecord[curPage])=="undefined"){

				// Ther'are no images

				var obj = {rImage: img, page: curPage};
								
				imageRecord.push(obj);
				
				}else{
					
					imageRecord[curPage].rImage = img;

				}

				self.clearCanvas();
				
				
				// Check if in the next page ther is a background image
				if(imageRecord[curPage-1].rImage != "undefined"){
									
					// Ther's an image in the background in the next page	
					img = imageRecord[curPage-1].rImage;
					var image = new Image();
					image.src = img; 					
					curPage--;
					
					
					image.onload = function(){
						  ctxt.drawImage(image, 0, 0);
						  self.reDraw();
						
					}
					
				}else{
					
					//There are no images
					self.reDraw();
					curPage--;
					img = "undefined";
					
				}
																						
				
			}
			
			console.log("sono arrivato");
			
			// Rebuilding the media list
			self.defMediaList();
			
			
		},
		
		sucPage: function(){
			
			// Check if I'm recording
			if(recording == true){
				
				// Sto recording
				self.recordAudioStop();
			}
			
			var x = document.getElementById("media");

	        document.getElementById("media_list").removeChild(x);
	
			var select = document.createElement("select");
	        select.setAttribute("id", "media");
			document.getElementById("media_list").appendChild(select);

			media_pl = document.getElementById('media');

			currentReg = "undefined";
			
			
			// Check if the current page is undefined
			if(typeof(pages[curPage])=="undefined"){
				
				// It's undefined. Now I prepare the new page
				var tempRecord = new Array();
				
				for(i = 0; i < record.length; i++){

					tempRecord.push(record[i]);

				}
				
				
				var obj = {rImage: img, page: curPage};
				imageRecord.push(obj);
				
				pages.push(tempRecord);
								
				self.clearCanvas();
				
				precRecord = new Array();
								
				record = new Array();
								
				curPage++; // OK
				
			}else{
				
				// It's defined, i prepare the new page
				var tempRecord = new Array();
				
				for(i = 0; i < record.length; i++){

					tempRecord.push(record[i]);
					
				}
				
				pages[curPage] = tempRecord;
				
				imageRecord[curPage].rImage = img;
				
				// Check if the next page is defined
				if(typeof(pages[curPage+1])=="undefined"){
					
					
					// It is undefined
					self.clearCanvas();

					record  = new Array;

					precRecord = new Array;
					
					img = "undefined";

					curPage++;
										
				}else{
					
					// It's defined
					self.clearCanvas();
					
					precRecord = new Array();
					record = new Array();
					
					for(i = 0; i < (pages[curPage+1]).length; i++){

						record.push(pages[curPage+1][i]);
						precRecord.push(pages[curPage+1][i]);

					}
					
					// Check if the next page has a background image
					if(imageRecord[curPage+1].rImage != "undefined"){
						
						// It has a background image. I draw it on the background
						img = imageRecord[curPage+1].rImage;
						var image = new Image();
						image.src = img;
						curPage++;
						
						image.onload = function(){

							  ctxt.drawImage(image, 0, 0);
							  self.reDraw();

						}

					}else{
						
						// It has no images
						self.reDraw();
						curPage++;
						img = "undefined";

					}
										
				}
				
			}
			
			self.defMediaList();
			
			
		},
		
	defMediaList: function(){
		
		console.log(audioRec.length);
		
		for( i = 0; i < audioRec.length; i++){
						
			if(audioRec[i][0].page == curPage){
			
				var option = document.createElement("option");
		        option.setAttribute("id", audioRec[i][0].name); 
		        option.setAttribute("value", audioRec[i][0].name); 


		        document.getElementById("media").appendChild(option);
				document.getElementById(audioRec[i][0].name).innerHTML = audioRec[i][0].name;
				document.getElementById(audioRec[i][0].name).selected = true;
			
			}
			
		}
		
		
		
	},	
		
	recordAudioStart: function(){
		
		recording  = true;
		
		var now = new Date();
		
		var src = "myrecording" + now.getHours() + now.getMinutes() + now.getSeconds() + now.getDay() + now.getYear() + ".mp3";
		
		currentReg = src;
		
		mediaRec = new Media(src, self.onSuccess, self.onError);

        mediaRec.startRecord();

		var curRecord = new Array;
		
		idA++;
		
		curRecord[0] = {id : idA, name: src, startRec: new Date(), stopRec: "null", page: curPage};
		
		console.log(curPage);
		
		audioRec.push(curRecord);

        document.getElementById("record_button").src = "css/icon_set/rec_a.png";
		
	},	
	
	
	recordAudioStop: function(){
		
		if(recording == true){
		
			recording = false;
		
			mediaRec.stopRecord();
		
			audioRec[audioRec.length - 1][0].stopRec = new Date();
		

			var option = document.createElement("option");
	        option.setAttribute("id", currentReg); 
	        option.setAttribute("value", currentReg); 

	        document.getElementById("media").appendChild(option);
			document.getElementById(currentReg).innerHTML = currentReg;
			document.getElementById(currentReg).selected = true;
		
		
			currentReg = "undefined";
		
			document.getElementById("record_button").src = "css/icon_set/rec_d.png";
        }
		
	},
	
	 onSuccess: function() {
        console.log("recordAudio():Audio Success");
    },

    // onError Callback 
    //
     onError: function(error) {
        alert('code: '    + error.code    + '\n' + 
              'message: ' + error.message + '\n');
    },
	
	playAudio: function(){
		
		//console.log(audioRec[audioRec.length - 1][0].id + " - " + audioRec[audioRec.length - 1][0].name + " - " + audioRec[audioRec.length - 1][0].startRec + " - " + audioRec[audioRec.length - 1][0].stopRec);
		
		// Salvataggio in stringa dell'array via JSON
		// var jsonData = JSON.stringify(audioRec);
		// 		
		// 		console.log(jsonData);
		// 		
		// 		var data = JSON.parse(jsonData);
		// 		
		// 		console.log(data[audioRec.length - 1][0].id + " - " + data[audioRec.length - 1][0].name);
		
		var src = media_pl.options[media_pl.selectedIndex].value;
		
		//var src = audioRec[audioRec.length - 1][0].name;
		
		my_media = new Media(src, self.onSuccess, self.onError);

		            // Play audio
		            my_media.play();
	},
	
	
	playAudioDraw: function(){

			
			var i = 0;
			var find = false;
			var nameT = media_pl.options[media_pl.selectedIndex].value;
			
			
			while(i < audioRec.length && find == false){
				
				if (audioRec[i][0].name == nameT){
					
					find = true;
					
				}else{	i++; }
				
				
			}
			
			var idT = audioRec[i][0].id;
			
			// var nameT = audioRec[i][0].name;
			
						
			var startT = audioRec[i][0].startRec;
			var stopT = audioRec[i][0].stopRec;

			// Totale secondi della traccia audio
			var totalTime = (stopT.getHours()*60*60000 + stopT.getMinutes()*60000 + stopT.getSeconds()) - (startT.getHours()*60*60000 + startT.getMinutes()*60000 + startT.getSeconds()*1000 + startT.getMilliseconds());

			queue = new Array();

			var firstT;

			// Calcolo quali tratti devo disegnare ed il tempo di ognuno + quanti sono
			for (j = 0; j < timerPage.length; j++){

				// Verifico se un tratto appartiene oppure no ad una determinata traccia audio
				if((timerPage[j][0].audio == nameT) && (timerPage[j][0].erased == false) && (timerPage[j][0].startDraw != timerPage[j][0].stopDraw)){

					var totS = (timerPage[j][0].stopDraw.getHours()*60*60000 + timerPage[j][0].stopDraw.getMinutes()*60000 + timerPage[j][0].stopDraw.getSeconds()*1000 + timerPage[j][0].stopDraw.getMilliseconds()) - (timerPage[j][0].startDraw.getHours()*60*60000 + timerPage[j][0].startDraw.getMinutes()*60000 + timerPage[j][0].startDraw.getSeconds()*1000 + timerPage[j][0].startDraw.getMilliseconds());
															
					var start = (timerPage[j][0].startDraw.getHours()*60*60000 + timerPage[j][0].startDraw.getMinutes()*60000 + timerPage[j][0].startDraw.getSeconds()*1000 + timerPage[j][0].startDraw.getMilliseconds()) - (startT.getHours()*60*60000 + startT.getMinutes()*60000 + startT.getSeconds()*1000 + startT.getMilliseconds())

					var elements = 0;

					// Calcolo il numero di elementi relativi ad uno stesso tratto
					for (y = 0; y < record.length; y ++){

						if(record[y][0].id == timerPage[j][0].idL) {elements++;}
					}

					queue.push({id : timerPage[j][0].idL, seconds : totS, nElements : elements });

				}

			}


			my_media = new Media(nameT, self.onSuccess, self.onError);

			// Play audio
			my_media.play();
			
			// Cicle to turn the lines in to gray for the sincronization with audio
			for(u = 0; u < queue.length; u ++){
				for(f = 0; f < record.length; f++){
									
						if((typeof(record[f+1])!="undefined") && (record[f][0].id == record[f+1][0].id) && (record[f][0].id == queue[u].id)){

							ctxt.strokeStyle = "lightgray";
							ctxt.lineWidth = record[f][0].size;
							ctxt.beginPath();
							ctxt.moveTo(record[f][0].x, record[f][0].y);
							ctxt.lineTo( record[f+1][0].x,  record[f+1][0].y);
							ctxt.stroke();
							ctxt.closePath();
						}
				}
			}
			
			var curX = 0;
			var curA = 0;	
			
			var tempW;
			
			// Cicle to calculate the first quantity of tipe before starting drawing
			for(z = 0, ext = false; z < record.length && ext == false; z++){
				
				if((typeof(record[z+1])!="undefined") && (record[z][0].id == record[z+1][0].id) && (record[z][0].id == queue[0].id)){
					
					tempW = (record[z][0].time.getHours()*60*60000 + record[z][0].time.getMinutes()*60000 + record[z][0].time.getSeconds()*1000 + record[z][0].time.getMilliseconds()) - (startT.getHours()*60*60000 + startT.getMinutes()*60000 + startT.getSeconds()*1000 + startT.getMilliseconds());
									
					ext = true;	
					
				}
			}
					
			setTimeout(function(){self.sincroDraw(curX, curA, 0)}, tempW);
		

	},
	
	sincroDraw: function(x, a, c){
		
		if(typeof(queue[a])!="undefined"){
		    // curW = queue[a].seconds / queue[a].nElements;
   		    // curW = Math.round(curW);
   			// curW = Math.floor(curW);
		 	curW = ((record[x+1][0].time.getHours()*60*60000 + record[x+1][0].time.getMinutes()*60000 + record[x+1][0].time.getSeconds()*1000 + record[x+1][0].time.getMilliseconds()) - (record[x][0].time.getHours()*60*60000 + record[x][0].time.getMinutes()*60000 + record[x][0].time.getSeconds()*1000 + record[x][0].time.getMilliseconds()));
			 
		}		
		
		if((typeof(record[x+1])!="undefined") && (record[x][0].id == record[x+1][0].id) && (record[x][0].id == queue[a].id)){
								
				ctxt.strokeStyle = record[x][0].color;
				ctxt.lineWidth = record[x][0].size;
				ctxt.beginPath();
				ctxt.moveTo(record[x][0].x, record[x][0].y);
				ctxt.lineTo( record[x+1][0].x,  record[x+1][0].y);
				ctxt.stroke();
				ctxt.closePath();
								
				c++;
								
				if(c+1<queue[a].nElements){
										
					setTimeout(function(){self.sincroDraw(x+1, a, c)}, curW);
					
				}else{
					
					var toWait;
					
					if (typeof(record[x+2])!="undefined"){
						toWait = ((record[x+2][0].time.getHours()*60*60000 + record[x+2][0].time.getMinutes()*60000 + record[x+2][0].time.getSeconds()*1000 + record[x+2][0].time.getMilliseconds()) - (record[x][0].time.getHours()*60*60000 + record[x][0].time.getMinutes()*60000 + record[x][0].time.getSeconds()*1000 + record[x][0].time.getMilliseconds()));
					}else{toWait = curW;}
					
					setTimeout(function(){self.sincroDraw(x+1, a+1, 0)}, toWait);

				}
								
		}else{
			
			if((x < record.length) && (typeof(record[x+1])!="undefined")){
				
				var exit = false;
				
				while((x < record.length) && (exit == false)){
					
					if(record[x][0].id != queue[a].id){
						
						x++;
												
					}else{exit = true;}
					
				}
			
				setTimeout(function(){self.sincroDraw(x, a, 0)}, 0);
			}
		}	
			
		
			
	},
		

    };

    return self.init();

};


$(function(){
  var start = new CanvasDrawr({id:"example"}); 
});