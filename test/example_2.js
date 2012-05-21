
var canvasWidth = 500;
var canvasHeight = 500;
var curCol = "red";
var lineW = 5;
var lineStyle = "round";
    
var CanvasDrawr = function(options) {

    var canvasDiv = document.getElementById('canvasDiv');
	var clearButton = document.getElementById('clear_canv');
	var purpleColor = document.getElementById('purple_b');
	var blackColor = document.getElementById('black_b');
	var canvas = document.createElement('canvas');
	var sizeSmall = document.getElementById('small');
	var sizeMedium = document.getElementById('medium');
	var sizeBig = document.getElementById('big');
	canvasDiv.appendChild(canvas);
	
	if(typeof G_vmlCanvasManager != 'undefined') {
	
		canvas = G_vmlCanvasManager.initElement(canvas);
	
	}

    ctxt = canvas.getContext("2d");
        
    canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
    canvas.width = canvas.offsetWidth;
    canvas.style.width = '';

    ctxt.lineWidth = lineW;
    ctxt.lineCap = lineStyle;
    ctxt.pX = undefined;
    ctxt.pY = undefined;

    var lines = [,,];
    var offset = $(canvas).offset();
    
    var self = {
        //bind click events
        init: function() {
            //set pX and pY from first click
            
            canvas.addEventListener('touchstart', self.preDraw, false);
            canvas.addEventListener('touchmove', self.draw, false);
			clearButton.addEventListener('mousedown' , self.clearCanvas, false);
            purpleColor.addEventListener('mousedown' , self.purpleColor, false);
			blackColor.addEventListener('mousedown', self.purpleColor, false);
			sizeSmall.addEventListener('mousedown', self.changeSize, false);
			sizeMedium.addEventListener('mousedown', self.changeSize, false);
			sizeBig.addEventListener('mousedown', self.changeSize, false);
            
        },

        preDraw: function(event) {

            $.each(event.touches, function(i, touch) {
              
                var id      = touch.identifier;
              
                lines[id] = { x     : this.pageX - offset.left, 
                              y     : this.pageY - offset.top, 
                              color : curCol
                           };
            });

            event.preventDefault();
        },

        draw: function(event) {
            var e = event, hmm = {};

            $.each(event.touches, function(i, touch) {
                var id = touch.identifier,
                    moveX = this.pageX - offset.left - lines[id].x,
                    moveY = this.pageY - offset.top - lines[id].y;

                var ret = self.move(id, moveX, moveY);
                lines[id].x = ret.x;
                lines[id].y = ret.y;
            });

            event.preventDefault();
        },

        move: function(i, changeX, changeY) {
            ctxt.strokeStyle = lines[i].color;
            ctxt.beginPath();
            ctxt.moveTo(lines[i].x, lines[i].y);

            ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
            ctxt.stroke();
            ctxt.closePath();

            return { x: lines[i].x + changeX, y: lines[i].y + changeY };
        },

		clearCanvas: function(event){
			
			ctxt.fillStyle = '#ffffff';
			ctxt.fillRect(0, 0, canvasWidth, canvasHeight);
						
			canvas.width = canvas.width;

			ctxt.lineWidth = lineW;
			
			ctxt.lineCap = lineStyle;
		    

		},
		
		
		purpleColor: function(event){
						
			if(this.id == 'purple_b'){
				
				curCol = "purple";
				
			}
			
			if(this.id=='black_b'){
				curCol = 'black';
			}
			
		},
		
		
		changeSize: function(event){
			
			if(this.id == 'small'){
				
				lineW = 5;
				
				ctxt.lineWidth = lineW;
				
			}
			
			if(this.id == 'medium'){
					
					lineW = 15;
					
					ctxt.lineWidth = lineW;
					
			}
				
			if(this.id == 'big'){
						
					lineW = 25;
						
					ctxt.lineWidth = lineW;
						
			}
					
				
			
		}
		

    };

    return self.init();

};





$(function(){
  var start = new CanvasDrawr({id:"example"}); 
});