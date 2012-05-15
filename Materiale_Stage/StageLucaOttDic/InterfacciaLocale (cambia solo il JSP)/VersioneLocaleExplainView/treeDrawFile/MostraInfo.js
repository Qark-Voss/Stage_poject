/*
Dipendenze:
Raphael Adapter

Descrizione:
Si occupa di creare un rettangolo dove sono mostrate le informazioni aggiuntive sulle operazioni e il nome dell'operazione. Se il rettangolo con le informazioni sfora dal canvas,
aumenta le dimensioni del canvas

Metodi
crea
remove
isDrawed

Membri:
_rettangoloContenitore,
_rettangoloRilevaEvento,
_arrayText,
_arrayPath,
_isDisegnato.
*/

function MostraInfo () {
	
	var _rettangoloContenitore,
	_rettangoloRilevaEvento,
	_arrayText,
	_arrayPath,
	_isDisegnato = false;
	
	//costruttore scrive a video le informazioni, tra ogni informazione c'e' un path (riga) e tra il nome e il valore della proprieta' i due punti
	this.crea = function (nomiProp, infoProp, canvas, x, y) {
		
		_arrayText = [];
		_arrayPath = [];
		var larghezza = 0,
		altezza = 0;

		var xtest = x + 10;
		larghezza = 0;
		var ytest = y + 10;
		for(var i=0; i < nomiProp.length; ++i) {
			var lunghezzaRiga = (nomiProp[i].toString().length + 3 + infoProp[i].toString().length) * 9 //stima della lunghezza del testo
			if(lunghezzaRiga < 250) {
				_arrayText.push(canvas.createText(xtest, ytest, nomiProp[i] + " : " + infoProp[i]).attr({"text-anchor": "start", "font-size": 13}));
				lunghezzaRiga = _arrayText[_arrayText.length-1].getBBox().width + 20; //20 e' margine
				ytest += 10;
				if(larghezza < lunghezzaRiga) {
					larghezza = lunghezzaRiga;
				}
			}
			else { //se e' troppo grande lo spezzo e mando a capo
				var words = infoProp[i].toString().split(" ");
				_arrayText.push(canvas.createText(xtest, ytest, nomiProp[i] + " : ").attr({"text-anchor": "start", "font-size": 13}));
				var offset = xtest + _arrayText[_arrayText.length-1].getBBox().width;
				var parolaDaScrivere = words[0]+ " ";
				for(var j = 1; j < words.length; ++j) {
					//se la parola oppure sommando la grandezza attuale della parola da scrivere e della prossima parola la stringa e' più grande di 200 scrivo quello che e' attualmente memorizzato
					if(words[j].length *9 >= 200 || parolaDaScrivere.length * 8 + words[j].length > 200) {
						_arrayText.push(canvas.createText(offset, ytest, parolaDaScrivere).attr({"text-anchor": "start", "font-size": 13}));
						lunghezzaRiga = _arrayText[_arrayText.length-1].getBBox().width + 20 + offset - xtest; //20 e' margine
						if(larghezza < lunghezzaRiga) {
							larghezza = lunghezzaRiga;
						}
						ytest +=15;
						parolaDaScrivere = words[j] + " ";
					} 
					else {
						parolaDaScrivere += words[j] + " ";
					}
				}
				if(parolaDaScrivere.length !=0) { //devo scrivere ancora qualcosa
					_arrayText.push(canvas.createText(offset, ytest, parolaDaScrivere).attr({"text-anchor": "start", "font-size": 13}));
					lunghezzaRiga = _arrayText[_arrayText.length-1].getBBox().width + 20 + offset - xtest; //20 e' margine
					if(larghezza < lunghezzaRiga) {
						larghezza = lunghezzaRiga;
					}
					ytest +=10
				}				
			}
			_arrayPath.push(canvas.createPath("M"+xtest.toString()+","+ytest.toString()+"H"+xtest.toString())); //temporaneo
			ytest += 10;
		}
		_arrayPath[_arrayPath.length - 1].remove();
		_arrayPath.pop(); 
		ytest -= 10; //elimino ultimo path e sistemo coordinata y totale
		
		//sistemo dimensione dei path
		for(var i = 0; i < _arrayPath.length; ++i) {
			var contorno = _arrayPath[i].getBBox();
			_arrayPath[i].attr({path: "M"+contorno.x.toString()+","+contorno.y.toString()+"H"+(larghezza+x-10).toString()});
		}
		
		var outerThis = this;
		_rettangoloContenitore = canvas.createRect(x, y, larghezza, ytest-y, 0).attr({fill: "#FFF68F"}); //disegno rettangolo contenitore
		_rettangoloContenitore.insertBefore(_arrayText[0]);
		
		//ingrandisco il canvas se necessario e il browser non supporta SVG
		if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
			if (_rettangoloContenitore.attr("x") + larghezza > canvas.getCanvas().width) {
				canvas.resizeCanvas(_rettangoloContenitore.attr("x") + larghezza + 2, -1); // 2 pixel in più per distanziare dal bordo del canvas
			}
			if (ytest > canvas.getCanvas().height) {
				canvas.resizeCanvas(-1, ytest + 2);
			}
		}
		//disegno rettangolo per cancellare correttamente. Se associo al rettangolo precedente e' mouseout anche se vado sul testo
		_rettangoloRilevaEvento = canvas.createRect(x-200, y-200, larghezza+400, ytest-y+400, 0).attr({fill: "#ffffff", stroke: 0, "fill-opacity": 0}); 

		_rettangoloRilevaEvento.node.onmousemove = function(event) {
				outerThis.remove();
		}
		_rettangoloRilevaEvento.insertBefore(_rettangoloContenitore); // così e' "sotto", mousemove non viene rilevato se sono all'interno dell'area
		_isDisegnato = true;
	}
	
	//cancella i vari elementi
	this.remove = function() {
		if(!_isDisegnato) {
			return;
		}
		if(_arrayText) {
			for(var i = 0; i < _arrayText.length; ++i) {
				_arrayText[i].remove();
			}
		}
		_arrayText = [];
		if(_arrayPath) {
			for(var i = 0; i < _arrayPath.length; ++i) {
				_arrayPath[i].remove();
			}
		}
		_arrayPath = [];
		if(_rettangoloContenitore) {
			_rettangoloContenitore.remove();
			_rettangoloRilevaEvento.remove();
		}
		_isDisegnato = false;
	}
	
	//se il tutto e' disegnato o meno
	this.isDrawed = function () {
		return _isDisegnato;
	}
}