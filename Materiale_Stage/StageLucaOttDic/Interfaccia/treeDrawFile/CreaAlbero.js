/*
N.B. Classe legata agli elementi della JSP
Dipende da: 
albertoMisto
alberoVerticale
alberoClassico

Descrizione:
La classe definisce alcune costanti e poi fornisce delle funzionalita' per disegnare la tipologia di albero selezionato. 

Metodi:
dimensioneCanvas <---- senza this.
init
crea <---- senza this.
ridisegnaAlbero

Membri:
_lunghezzaNodoStandard,
_altezzaNodoStandard,
_spazioStandard,
_JSONOriginale,
_creatorGraphicalObject,
_modalitaDisegnata,
_tipoDisegno;
*/


function CreaAlbero () {	
	var _lunghezzaNodoStandard = 120,
	_altezzaNodoStandard = 80,
	_spazioStandard = 15,
	_JSONOriginale,
	_creatorGraphicalObject,
	_modalitaDisegnata,
	_tipoDisegno;
	
	//per calcolare dimensione che il canvas dovra' avere, usata solo se browser supporta SVG 
	var dimensioneCanvas = function (obj) {
		var dimCanvasX = 0,
		dimCanvasY = 0;
		
		if(window.innerWidth && window.innerHeight) {
			dimCanvasX = window.innerWidth;
			dimCanvasY = window.innerHeight;
		}

		if(obj.offsetParent) { 
			do {
				dimCanvasX -= obj.offsetLeft;
				dimCanvasY -= obj.offsetTop;
				obj = obj.offsetParent;
			} while (obj); //l'elemento e' contenuto in un altro
		}
		else {
			alert("Non posso calcolare offset");
		}
		
		return [dimCanvasX, dimCanvasY];
	}
	
	//questo costruttore inizializza il JSON 
	this.init = function (JSon) {
		if(JSon.nome && !_JSONOriginale) { //inizializzo il JSON se e solo se il parametro e' corretto e non e' gia' inizializzato
			_JSONOriginale = JSon;
		}
	}
	
	//disegna l'albero della modalita'  scelta.
	var crea = function(choice) {
		var JSon = _JSONOriginale;
		if(JSon.nome) {
			_modalitaDisegnata = choice;
			switch(choice) {
				case "Misto":
					_tipoDisegno = new albertoMisto();
					_tipoDisegno.creaRadice(JSon, _creatorGraphicalObject, _lunghezzaNodoStandard, _altezzaNodoStandard, _spazioStandard);
					break;
			
				case "Verticale": 
					_tipoDisegno = new alberoVerticale();
					_tipoDisegno.creaRadice(JSon, _creatorGraphicalObject, _lunghezzaNodoStandard, _altezzaNodoStandard, _spazioStandard); 
					break;
				
				case "Classico": 
					_tipoDisegno = new alberoClassico();
					_tipoDisegno.creaRadice(JSon, _creatorGraphicalObject, _lunghezzaNodoStandard, _altezzaNodoStandard, _spazioStandard);
				
					break;
			}
		}
		else {
			alert("il JSON non e' correttamente formattato");
		}
	}
	
	//cancella e richiama crea con la modalita' scelta
	this.ridisegnaAlbero = function(idMenu, nomeId) {
		var indiceElementoScelto = document.getElementById(idMenu).selectedIndex;
		var modalitaScelta = document.getElementById(idMenu).options[indiceElementoScelto].value;
		
		if(modalitaScelta === _modalitaDisegnata) { //se la modalita che e' attualmente disegnata e' uguale a quella scelta, non faccio nulla.
			return; 
		}
		if(_creatorGraphicalObject && _tipoDisegno) {
			_tipoDisegno.cancellaAlbero();
			_creatorGraphicalObject.ripulisci();
			_creatorGraphicalObject = null;
		}
		if(!_creatorGraphicalObject) {
			_creatorGraphicalObject = new RaphaelAdapter();
			_creatorGraphicalObject.createCanvas(nomeId);
			if(document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
				var dim = dimensioneCanvas(document.getElementById(nomeId));
				_creatorGraphicalObject.resizeCanvas(dim[0], dim[1]);
				window.onresize = function() {
					var dim = dimensioneCanvas(document.getElementById(nomeId));
					_creatorGraphicalObject.resizeCanvas(dim[0], dim[1]);
				}
				new RaphaelZPDAdapter().init(_creatorGraphicalObject.getCanvas(), true, true, false);
				//se non è IE8 allora funziona il pan
				var corpo = document.getElementsByTagName("body");
				corpo[0].style.overflow = "hidden";
			}
		}
		crea(modalitaScelta);
	}
}