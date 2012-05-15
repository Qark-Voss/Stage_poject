var IRaphaelInterface = new Interface('IRaphaelInterface', ['createCanvas', 'getCanvas', 'getWidthcanvas', 'getHeightcanvas', 'createRect', 'createCircle', 'createImage', 'createPath', 'createText', 'ripulisci']);

//funzione aggiunta ad ogni elemento Raphael, ritorna true se l'elemento e' visibile. Decommentare se serve
// Raphael.el.isVisible = function() {
			// return (this.node.style.display !== "none");
		// }

/*
Interfaccia per ottenere oggetti della libreria Raphael, ogni funzione controlla se i parametri siano corretti, se non lo sono fa comparire un avviso e ritorna null

Metodi:
createCanvas, costruttore
----- metodi get -----
getCanvas
getWidthcanvas
getHeightcanvas
----- fine metodi get -----
resizeCanvas
----- metodi per disegnare oggetti -----
createRect
createCircle
createImage
createPath
createText
----- fine metodi per disegnare oggetti -----
ripulisci

Membri:
_canvas
_nomeId
*/
function RaphaelAdapter() {
	var _canvas,
	_nomeId;
	
	//creo lo sfondo. Necessario dare un id di un elemento della pagina JSP/HTML che conterra' l'oggetto Raphael
	this.createCanvas = function(nomeId) {
		if(!_canvas) {
			_nomeId = nomeId;
			_canvas = Raphael(nomeId, 0, 0); //l'utilizzatore del canvas si occupera' di evocare resizeCanvas
		}
	}

	//ottengo un riferimento allo sfondo
	this.getCanvas = function() {
		return _canvas;
	}
	
	this.getWidthcanvas = function () {
		return _canvas.width;
	}
	
	this.getHeightcanvas = function () {
		return _canvas.height;
	}
	
	this.getNomeId = function () {
		return _nomeId;
	}
	
	//ridimensiono la tavolozza, se uno dei due parametri e' inferiore a 1 riprendo il valore originale del parametro inferiore a 1
	this.resizeCanvas = function(larghezza, altezza) {
		if(typeof altezza != "number" || typeof larghezza != "number") {
			alert("parametri errati per ridemensionamento canvas");
			return;
		}
		if(larghezza < 1) {
			larghezza = _canvas.width;
		}
		if(altezza < 1) {
			altezza = _canvas.height;
		}
		_canvas.setSize(larghezza, altezza);
	}
	
	//creo un rettangolo e lo restituisco
	this.createRect = function(x, y, larghezza, altezza, rotonditaAngoli, color) {
		if(typeof x != "number" || typeof y != "number" || typeof altezza != "number" || typeof larghezza != "number" || typeof rotonditaAngoli != "number") {
			alert("parametri non validi per creare rettangolo");
			return null;
		}
		return _canvas.rect(x, y, larghezza, altezza, rotonditaAngoli).attr({fill: color});
	}
	
	//creo un cerchio e lo restituisco
	this.createCircle = function(x, y, r) {
		if(typeof x != "number" || typeof y != "number" || typeof r != "number") {
			alert("parametri non validi per creare cerchio");
			return null;
		}
		return _canvas.circle(x, y, r)
	}
	
	//creo un'immagine e la restituisco
	this.createImage = function(path, x, y, altezza, larghezza) {
		if(typeof x != "number" || typeof y != "number" || typeof altezza != "number" || typeof larghezza != "number" ) {
			alert("parametri non validi per creare immagine");
			return null;
		}
		return _canvas.image(path, x, y, larghezza, altezza);
	}
	
	//creo una curva
	this.createPath = function(path) {
		return _canvas.path(path);
	}
	
	//creo un oggetto di tipo testo
	this.createText = function(x, y, text) {
		if(typeof x != "number" || typeof y != "number" ) {
			alert("parametri non validi per testo");
			return null;
		}
		return _canvas.text(x, y, text);
	}
	
	//ripulisce la tavola. Attenzione, non elimina gli oggetti non collegati a Raphael, cancella solo il disegno
	this.ripulisci = function() {
		// _canvas.remove(); provoca problemi con ZPD
		_canvas.setSize(0, 0);
		_canvas = null;
	}
}