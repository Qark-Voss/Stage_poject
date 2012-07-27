
    
var CanvasDrawr = function(options) {
	
	// Variables connected to the canvas
	var canvasWidth = 1100;
	var canvasHeight = 550;
	var curCol = "black";
	var precEraser = "black";
	var lineW = 2;
	var lineStyle = "round";
	var img = "undefined";
	var startTime;
	var endTime;
	var curX = 0;
	var curY = 0;
	var idM = 0;
	var idA = 0;
	var paint;
	var bg = new Image();
	var record = new Array();
	var precRecord = new Array();
	var imageRecord = new Array();
	var pages = new Array();
	var curPage = 0;


	// Variables for the audio registration
	var audioRec = new Array();
	var mediaRec;
	var currentReg = "undefined";
	var timerPage = new Array();
	var recording = false;

	// Variables for the audio sincronization
	var queue = new Array();
	var curX = 0;
	var curC = 0;
	var curW = 0;
	
	
	// Getting the canvas div
    var canvasDiv = document.getElementById('canvasDiv'); 

	// Getting canvas managing buttons
	var clearButton = document.getElementById('clear_canv'); 
	var saveButton = document.getElementById('save_canv'); 
	var loadButton = document.getElementById('load_canv'); 
	
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
	
	// Getting the navigator buttons and undo/redo
	var reDo = document.getElementById('reDo_button');
	var unDo = document.getElementById('unDo_button');
	var prec = document.getElementById('prec_button');
	var suc = document.getElementById('suc_button');
	
	
	// Getting the button to load images
	var loadImg = document.getElementById('load');
	
	// Creating a new element for the HTML page: canvas
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
            canvas.addEventListener('touchstart', trackDrawer.preDraw, false);
            canvas.addEventListener('touchmove', trackDrawer.draw, false);
			canvas.addEventListener('touchmove', self.position, false);
			
			// Appends the mouse listener to the canvas for the drawing operations
			canvas.addEventListener('mousemove', trackDrawer.drawM, false);
			canvas.addEventListener('mouseup', trackDrawer.stopDrawM, false);
			canvas.addEventListener('mouseout', trackDrawer.stopDrawM, false);
			canvas.addEventListener('mousedown', trackDrawer.preDrawM, false);
			
			// Appends the mouse listener to the various buttons of the toolbar
			
			//Clear button
			clearButton.addEventListener('mousedown' , canvasManager.clearCanvas, false);
			
			//Save button
			saveButton.addEventListener('mousedown' , saveFile.saveCanvas, false);
			loadButton.addEventListener('mousedown' , readFile.loadCanvas, false);
			
			
			//Colors buttons
            blueColor.addEventListener('mousedown' , trackTools.changeColor, false);
			blackColor.addEventListener('mousedown', trackTools.changeColor, false);
			orangeColor.addEventListener('mousedown' , trackTools.changeColor, false);
			redColor.addEventListener('mousedown', trackTools.changeColor, false);
			greenColor.addEventListener('mousedown' , trackTools.changeColor, false);
			yellowColor.addEventListener('mousedown', trackTools.changeColor, false);
			whiteColor.addEventListener('mousedown' , trackTools.changeColor, false);
			greyColor.addEventListener('mousedown', trackTools.changeColor, false);
			brownColor.addEventListener('mousedown' , trackTools.changeColor, false);
			
			// Undo - Redo buttons
			reDo.addEventListener('mousedown' , history.reDo, false);
			unDo.addEventListener('mousedown' , history.unDoLine, false);
			
			// Navigator buttons
			prec.addEventListener('mousedown', navigatorTools.precPage, false);
			suc.addEventListener('mousedown', navigatorTools.sucPage, false);
			
			// Audio buttons
			rec.addEventListener('mousedown', audioManager.recordAudioStart, false);
			stop.addEventListener('mousedown', audioManager.recordAudioStop, false);
			// play.addEventListener('mousedown', audioManager.playAudio, false);
			playD.addEventListener('mousedown', audioManager.playAudioDraw, false);
			
			//Sizes buttons
			sizeOne.addEventListener('mousedown', trackTools.changeSize, false);
			sizeTwo.addEventListener('mousedown', trackTools.changeSize, false);
			sizeThree.addEventListener('mousedown', trackTools.changeSize, false);
			sizeFour.addEventListener('mousedown', trackTools.changeSize, false);
			sizeFive.addEventListener('mousedown', trackTools.changeSize, false);
			sizeSix.addEventListener('mousedown', trackTools.changeSize, false);
			
			//Tools buttons
			pencilTool.addEventListener('mousedown', trackTools.selectTool, false);
			eraserTool.addEventListener('mousedown', trackTools.selectTool, false);
			loadImg.addEventListener('mousedown', canvasManager.loadNewImg, false);			
			
            
        },

    };

	// Class with functions that draw the track
	var trackDrawer = {
		
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

								timerPage.push(drawTime);

								timerPage[timerPage.length - 1][0].stopDraw = timerPage[timerPage.length - 1][0].startDraw;

								record.push(curData);

								canvasManager.copyArray();

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
	                var ret = trackDrawer.move(id, moveX, moveY);
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

	            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
	            ctxt.stroke();
	            ctxt.closePath();

	            return { x: lines[i].x + changeX, y: lines[i].y + changeY };
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

					canvasManager.copyArray();

				    event.preventDefault();

	        },

			//This operation starts to thake the coordinates of the mouse mooves and call the "move" function that draw the lines
	        drawM: function(event) {

					if (paint){

	                moveX = event.pageX - this.offsetLeft - lines[idM].x ,
	                moveY = event.pageY - this.offsetTop - lines[idM].y ;

					// I call the real draw operation
	                var ret = trackDrawer.move(idM, moveX, moveY);
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

			},
		
	};
	
	
	
	// Class that contains the drawing tools
	var trackTools = {
		
		//Function that allows to select different tools
		selectTool: function(event){
			
			if(this.id == 'pencil'){
				
				curCol = precEraser;
				
			}
			
			if(this.id == 'eraser'){
				
				precEraser = curCol;
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
		
	};
	
	// Class that contains the audio functions
	var audioManager = {
		
		// Function that start the audio recording
		recordAudioStart: function(){

			recording  = true;

			var now = new Date();

			// Define the audio file name
			var src = "myrecording" + now.getHours() + now.getMinutes() + now.getSeconds() + now.getDay() + now.getYear() + ".mp3";

			currentReg = src;
			
			// Define a new media object
			mediaRec = new Media(src, audioManager.onSuccess, audioManager.onError);

			// Start recording
	        mediaRec.startRecord();

			var curRecord = new Array;

			idA++;
			
			curRecord[0] = {id : idA, name: src, startRec: new Date(), stopRec: "null", page: curPage};

			console.log(curPage);

			audioRec.push(curRecord);

	        document.getElementById("record_button").src = "css/icon_set/rec_a.png";

		},	

		// Function that stop the audio recording
		recordAudioStop: function(){

			if(recording == true){
				
				recording = false;
				
				// Stop recording
				mediaRec.stopRecord();

				audioRec[audioRec.length - 1][0].stopRec = new Date();

				// Define the audio menu tracks
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


	     onError: function(error) {
	        alert('code: '    + error.code    + '\n' + 
	              'message: ' + error.message + '\n');
	    },

		playAudio: function(){

			var src = media_pl.options[media_pl.selectedIndex].value;

			my_media = new Media(src, audioManager.onSuccess, audioManager.onError);

			// Play audio
           	my_media.play();
		},

		// Function that play audio and sincronizes the track
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

				var startT = audioRec[i][0].startRec;
				
				console.log(startT);
								
				var stopT = audioRec[i][0].stopRec;

				// Ammount of total seconds 
				var totalTime = (stopT.getHours()*60*60000 + stopT.getMinutes()*60000 + stopT.getSeconds()) - (startT.getHours()*60*60000 + startT.getMinutes()*60000 + startT.getSeconds()*1000 + startT.getMilliseconds());

				queue = new Array();

				var firstT;

				// Calculate the line that I have to draw
				for (j = 0; j < timerPage.length; j++){

					// Verify if a line belong to an audio track or not
					if((timerPage[j][0].audio == nameT) && (timerPage[j][0].erased == false) && (timerPage[j][0].startDraw != timerPage[j][0].stopDraw)){

						var totS = (timerPage[j][0].stopDraw.getHours()*60*60000 + timerPage[j][0].stopDraw.getMinutes()*60000 + timerPage[j][0].stopDraw.getSeconds()*1000 + timerPage[j][0].stopDraw.getMilliseconds()) - (timerPage[j][0].startDraw.getHours()*60*60000 + timerPage[j][0].startDraw.getMinutes()*60000 + timerPage[j][0].startDraw.getSeconds()*1000 + timerPage[j][0].startDraw.getMilliseconds());

						var start = (timerPage[j][0].startDraw.getHours()*60*60000 + timerPage[j][0].startDraw.getMinutes()*60000 + timerPage[j][0].startDraw.getSeconds()*1000 + timerPage[j][0].startDraw.getMilliseconds()) - (startT.getHours()*60*60000 + startT.getMinutes()*60000 + startT.getSeconds()*1000 + startT.getMilliseconds())

						var elements = 0;

						// Calculate the number of elements of a tract
						for (y = 0; y < record.length; y ++){

							if(record[y][0].id == timerPage[j][0].idL) {elements++;}
						}

						queue.push({id : timerPage[j][0].idL, seconds : totS, nElements : elements });

					}

				}


				my_media = new Media(nameT, audioManager.onSuccess, audioManager.onError);

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

				setTimeout(function(){audioManager.sincroDraw(curX, curA, 0)}, tempW);


		},

		// Function that draw a line sincronized to the draw timing
		sincroDraw: function(x, a, c){

			if(typeof(queue[a])!="undefined"){
			     curW = queue[a].seconds / queue[a].nElements;
	   		     // curW = Math.round(curW);
	   			 curW = Math.floor(curW);
	
				console.log(curW);				
			 	// curW = ((record[x+1][0].time.getHours()*60*60000 + record[x+1][0].time.getMinutes()*60000 + record[x+1][0].time.getSeconds()*1000 + record[x+1][0].time.getMilliseconds()) - (record[x][0].time.getHours()*60*60000 + record[x][0].time.getMinutes()*60000 + record[x][0].time.getSeconds()*1000 + record[x][0].time.getMilliseconds()));

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

						setTimeout(function(){audioManager.sincroDraw(x+1, a, c)}, curW);

					}else{

						var toWait;

						if (typeof(record[x+2])!="undefined"){
							toWait = ((record[x+2][0].time.getHours()*60*60000 + record[x+2][0].time.getMinutes()*60000 + record[x+2][0].time.getSeconds()*1000 + record[x+2][0].time.getMilliseconds()) - (record[x][0].time.getHours()*60*60000 + record[x][0].time.getMinutes()*60000 + record[x][0].time.getSeconds()*1000 + record[x][0].time.getMilliseconds()));
						}else{toWait = curW;}

						setTimeout(function(){audioManager.sincroDraw(x+1, a+1, 0)}, toWait);

					}

			}else{

				if((x < record.length) && (typeof(record[x+1])!="undefined")){

					var exit = false;

					while((x < record.length) && (exit == false)){

						if(record[x][0].id != queue[a].id){

							x++;

						}else{exit = true;}

					}

					setTimeout(function(){audioManager.sincroDraw(x, a, 0)}, 0);
				}
			}	



		},
		
		// Define the media list
		defMediaList: function(){

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
		
	};


	// Class that contains functions to manage the canvas
	var canvasManager = {
	
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
		
		// Function that load a new image
		loadNewImg: function(event){
								
			navigator.camera.getPicture(canvasManager.onPhotoURISuccess, canvasManager.onFail, { quality: 50, 
		    destinationType: navigator.camera.DestinationType.FILE_URI,
		    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
			
		},
		
		// Function that draw an image to the canvas
		onPhotoURISuccess: function(imageURI) {
				
			var image = new Image();
			image.src = imageURI;

			canvasManager.clearCanvas();

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
		
		// function that copy an array to another
		copyArrayPro: function(first, second){
			
			second = new Array();
			
			for(i = 0; i < first.length; i++){
				
				second.push(first[i]);
				
			}
			
		},
		
		// Function that copy the content of record in precRecord
		copyArray: function(event){
			
			
			precRecord = new Array();
			
			for(i = 0; i < record.length; i++){
				
				precRecord.push(record[i]);
				
			}
		},
			
		// Function that copy precRecord in record
		copyArray2: function(event){
			
			record = new Array();

			for(i = 0; i < precRecord.length; i++){

				record.push(precRecord[i]);

			}
		
		},
		
		// Function that draw the canvas from the record array
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
		
		
	};


	// Class that contains the functions to erase and redo the latest lines
	var history = {
		
		// Function that erase the last line drew
		unDoLine: function(event){
			
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
	
	
			if(img != "undefined"){	
								
				var image = new Image();
				image.src = img;

				canvasManager.clearCanvas();
				
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
				
				canvasManager.clearCanvas();
				
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


		// Function that redraw the last line
		reDo: function(event){
			
			var posLeft = this.offsetLeft;
			var posTop = this.offsetTop;
						
			if(precRecord.length > record.length){
			
					if(img != "undefined"){	

						var image = new Image();
						image.src = img;

						canvasManager.clearCanvas();

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
				
							canvasManager.copyArray2();
				
						}
				
					}else{
						
						canvasManager.clearCanvas();
						
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
			
						canvasManager.copyArray2();
						
						
					}
					
					timerPage[timerPage.length - 1][0].erased = false;
					
			}	
					
			
		},
		
	};
	
	// Class that contains the functions to explore the canvas pages
	var navigatorTools = {
		
		// Functoin that visualized the next page
		precPage: function(){
			
			// Check if this is the first page or not
			if(curPage>0){
				
				// It is not the first page
				if(recording == true){
					audioManager.recordAudioStop();
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

				canvasManager.clearCanvas();
				
				
				// Check if in the next page ther is a background image
				if(imageRecord[curPage-1].rImage != "undefined"){
									
					// Ther's an image in the background in the next page	
					img = imageRecord[curPage-1].rImage;
					var image = new Image();
					image.src = img; 					
					curPage--;
					
					
					image.onload = function(){
						  ctxt.drawImage(image, 0, 0);
						  canvasManager.reDraw();
						
					}
					
				}else{
					
					//There are no images
					canvasManager.reDraw();
					curPage--;
					img = "undefined";
					
				}
																						
				
			}
						
			// Rebuilding the media list
			audioManager.defMediaList();
			
			
		},
		
		// Function that visualized the precedent page
		sucPage: function(){
			
			// Check if I'm recording
			if(recording == true){
				
				// Sto recording
				audioManager.recordAudioStop();
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
								
				canvasManager.clearCanvas();
				
				precRecord = new Array();
								
				record = new Array();
								
				curPage++; // OK
				
				img = "undefined";
				
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
					canvasManager.clearCanvas();

					record  = new Array;

					precRecord = new Array;
					
					img = "undefined";

					curPage++;
										
				}else{
					
					// It's defined
					canvasManager.clearCanvas();
					
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
							  canvasManager.reDraw();

						}

					}else{
						
						// It has no images
						canvasManager.reDraw();
						curPage++;
						img = "undefined";

					}
										
				}
				
			}
			
			audioManager.defMediaList();
			
			
		},
		
	};


	// Class that contains the save file function
	var saveFile = {
		
		saveCanvas: function(event){
														
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, saveFile.gotFS, saveFile.failW);

		},
		
		gotFS: function(fileSystem){
			
			fileSystem.root.getFile("audioRec.txt", {create: true, exclusive: false}, saveFile.gotFileEntry, saveFile.failW);
			fileSystem.root.getFile("timerPage.txt", {create: true, exclusive: false}, saveFile.gotFileEntry, saveFile.failW);
			fileSystem.root.getFile("pages.txt", {create: true, exclusive: false}, saveFile.gotFileEntry, saveFile.failW);
			fileSystem.root.getFile("imageRecord.txt", {create: true, exclusive: false}, saveFile.gotFileEntry, saveFile.failW);
			
			
		}, 
		
		gotFileEntry: function(fileEntry) {
			
			var jsonData;
			
			navigatorTools.sucPage();
			navigatorTools.precPage();
			
			if(fileEntry.name == "audioRec.txt"){
				
				jsonData = JSON.stringify(audioRec);		
					
			}
			
			if(fileEntry.name == "timerPage.txt"){
				
				 jsonData = JSON.stringify(timerPage);		
			}
			
			if(fileEntry.name == "pages.txt"){
											
				jsonData = JSON.stringify(pages);		
				
			}
			
			if(fileEntry.name == "imageRecord.txt"){
				
				jsonData = JSON.stringify(imageRecord);		
					
			}
			
	        fileEntry.createWriter(function(writer){
		
				writer.write(jsonData);
				
				
			}, saveFile.failW);
						
	    }, 
	
		gotFileWriter: function(writer){
					
				
		}, 
		
		failW: function(error) {
	        console.log(error.code);
	    },
		
		
	};
	
	// Class that contains the functions to load a file
	var readFile = {
		
		
		
		loadCanvas: function(event){
			
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readFile.gotFS, readFile.failR);
			
		},
		
		gotFS: function(fileSystem){
			
			fileSystem.root.getFile("audioRec.txt", null, readFile.gotFileEntry, readFile.failR);
			fileSystem.root.getFile("timerPage.txt", null, readFile.gotFileEntry, readFile.failR);
			fileSystem.root.getFile("pages.txt", null, readFile.gotFileEntry, readFile.failR);
			fileSystem.root.getFile("imageRecord.txt", null, readFile.gotFileEntry, readFile.failR);

		},
		
		gotFileEntry: function(fileEntry) {

			console.log("lettura file");

			
			if(fileEntry.name == "audioRec.txt"){
					
				fileEntry.file(function(fileW){
													
									var reader = new FileReader();
							        reader.onloadend = function(evt) {
								
										console.log("lettura traccia audio");
										
							            console.log(evt.target.result);
							
										var temp = evt.target.result;										
										
										audioRec = JSON.parse(temp);
																				
										console.log(audrioRec[0][0]);
										
										// idA = audioRec[audioRec.length][0].id;

							        };
							        reader.readAsText(fileW);
									
				}, readFile.failR);
					
			}
			
			if(fileEntry.name == "timerPage.txt"){
				
				fileEntry.file(function(fileW){
											
											
													
									var reader = new FileReader();
							        reader.onloadend = function(evt) {

										console.log("lettura storico tratti");

							            // console.log(evt.target.result);
										var temp = evt.target.result;
										timerPage = JSON.parse(temp);
										
										idM = timerPage[timerPage.length - 1][0].idL ; 

										console.log(idM);
										
							        };
							        reader.readAsText(fileW);
									
				}, readFile.failR);		
					
			}
			
			if(fileEntry.name == "imageRecord.txt"){
				
				fileEntry.file(function(fileW){
				
									
									var reader = new FileReader();
							        reader.onloadend = function(evt) {
								
										console.log("lettura immagini");
								
							            // console.log("Read as text");
							            console.log(evt.target.result);
							
										var temp = evt.target.result;
										imageRecord = JSON.parse(temp);
										
										img = imageRecord[curPage].rImage;
										
										navigatorTools.sucPage();
										navigatorTools.precPage();

							        };
							        reader.readAsText(fileW);
									
				}, readFile.failR);	
					
			}
			
			if(fileEntry.name == "pages.txt"){
				
				fileEntry.file(function(fileW){
													
									var reader = new FileReader();
							        reader.onloadend = function(evt) {
							            // console.log(evt.target.result);
								
										console.log("Lettura pagine");
								
										var temp = evt.target.result;
							
										 pages = jQuery.parseJSON(temp);
										
										// pages = evalJSON(temp).plugin;
										
										record = pages[curPage];
										
										precRecord = pages[curPage];
										
										console.log(pages[0][0][0].id);
										
										navigatorTools.sucPage();
										navigatorTools.precPage();
										
							        };
							        reader.readAsText(fileW);
									
				}, readFile.failR);		
			
				navigatorTools.sucPage();
				navigatorTools.precPage();
				
			}

		},
		
		failR: function(event){
			
			console.log(event.target.error.code);

		}
		
	};

    return self.init();

};


$(function(){
  var start = new CanvasDrawr({id:"example"}); 
});