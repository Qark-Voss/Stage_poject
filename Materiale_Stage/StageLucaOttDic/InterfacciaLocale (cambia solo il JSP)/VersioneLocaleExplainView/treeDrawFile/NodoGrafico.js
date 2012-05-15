/*
Dipende da:
NodoLogico
RaphaelAdapter

Descrizione:
Si occupa di gestire un nodo dal punto di vista grafico, al suo interno contiene un oggetto di tipo NodoLogico. 
Ogni metodo o campo e' descritto nel codice, qui solo elenco con categorizzazione
Metodi disponibili sono:
init, costruttore
----- metodi get -----
getRadice,
getFirstAncientRedraw,
getPadre,
getFiglio,
getHowManyChild,
getPuntoX,
getLarghezza,
getPuntoY,
getAltezza,
getLarghezzaSubTree,
getAltezzaSubTree,
hasHiddenChild,
getMinWidthSubTree,
getMinHeightSubTree,
----- fine metodi get -----
----- spostamento nodo e figli. Non sono il drag dei figli o del nodo, possono essere utilizzati dalla funzionalita' drag-----
setX,
setY,
spostaFigli,
aggiornaConnettore,
associaDrag <----  non ha this.
----- fine spostamento -----
addFiglio, <----- per aggiungere Figli al nodo
----- cancellazione -----
deleteTree,
deleteSubTree,
----- fine cancellazione -----
----- nascondi -----
hideShowFigli,
hideShow,
----- fine nascondi -----
----- calcolo del connettore -----
controllaSpazio,
- calcoloCoordinate, <---- non e' this.
ottieniCoordinateCurva
----- fine calcolo del connettore -----
----- per redraw albero -----
- reDrawFunction <---- non e' this.
- riMostraSottoAlberoPrecedente <---- non e' this.

Membri:
_contenitore,
_figli,
_padre,
_connettore, 
_infoLogiche,
_hideButton,
_hasHideSubTree, 
_canvas, 
_iconReDraw,
_isReDraw,
percorsoImmagini,
dimIcone
*/

function NodoGrafico() {
	
	//var per indicare dove si trovano le immagini
	var percorsoImmagini = "treeDrawFile/image/";
	//var per indicare le dimensioni delle icone e del riquadro con il colore.
	var dimIcone = 20;
	
	var _contenitore, //rettangolo esterno che contiene tutto il nodo
	_figli,
	_padre,
	_connettore, //rif al connettore al padre se presente
	_infoLogiche, //rif alla parte logica
	_hideButton, //rif al buttone per nascondere il sottoalbero
	_hasHideSubTree, //valore per sapere se il nodo ha il proprio sottoalbero nascosto
	_canvas, //rif a RaphaelAdapter
	_iconReDraw, //icona per ridisegnare solo il sottoalbero
	_isReDraw; //segnala se il nodo e' stato spostato in seguito ad un re-draw 
	
	/*costruttore e inizializzatore. Si occupa di associare i vari eventi del mouse ai singoli elementi.
	come parametri vi sono il nome, il colore, le informazioni aggiuntive, i nomi delle informazioni aggiuntive, le coordinate dove disegnare, le dimensioni, 
	il riferimento al RaphaelAdapter e al padre (null se non ce l'ha, ovvero la radice)*/
	this.init = function (nome, colore, infoaggiuntive, nomiInfoAggiuntive, origX, origY, larghezza, altezza, canvas, father) {
		//controllo sui tipi dei parametri
		if( typeof origX!= "number" || typeof origY!= "number" || !(canvas instanceof RaphaelAdapter) || !(father == null || father instanceof NodoGrafico) || typeof larghezza!= "number" || typeof altezza!= "number") {
			alert("uno dei parametri di creazione del nodo grafico \350 errato"); 
			return;
		}
		
		//inizializzo la componente logica il contenitore esterno
		
		_infoLogiche = new NodoLogico();
		_infoLogiche.init(nome, colore, infoaggiuntive, nomiInfoAggiuntive);
		if(!_infoLogiche) { //qualcosa nella creazione della parte logica non ha funzionato
			return;
		}
		_canvas = canvas;
		var tuttiGliElementi = []; //questo array contiene TUTTI gli elementi del nodo, esclusi il connettore, i figli e il padre. Serve per il drag
		
		//contiene tutti gli elementi possibili
		_contenitore = canvas.createRect(origX, origY, larghezza, altezza, 0).attr({fill: "#ffffff"}); //lo sfondo e' bianco
		tuttiGliElementi.push(_contenitore);
		
		//qui viene definito un colore, se si vuole immagine utilizzare la funzione canvas.createImage(path, x, y, larghezza, altezza). eseguire il push sull'array!
		var indicatore = canvas.createRect(origX + larghezza - dimIcone - 5, origY + 5, dimIcone, dimIcone, 0).attr({fill: _infoLogiche.getColore()});
		tuttiGliElementi.push(indicatore);
		
		_contenitore.pair = tuttiGliElementi;
		_hasHideSubTree = false;
		_isReDraw = false;
		
		//scrivo il testo, se e' più grande di tot caratteri scrivo i primi tot - 2 caratteri, poi 3 puntini. Nome completo visibile andando sul bottone i in ogni caso. tot dipende da quanto e' grande il rettangolo
		var testuale;
		//un carattere 8 pixel, sottraggo alla larghezza un valore pari a quanto occupato dai bottoni e ottengo il numero di caratteri ammesso 
		if(_infoLogiche.getNome().length > Math.floor((larghezza - 40)/8)) { 
			testuale = canvas.createText(origX+10, origY+15, _infoLogiche.getNome().substr(0,Math.floor((larghezza - 40)/8 - 2))+"...").attr({"text-anchor": "start", "font-size": 16, "font-family": "Arial, Helvetica, sans-serif" });
		}
		else {
			testuale = canvas.createText(origX+10, origY+15, _infoLogiche.getNome()).attr({"text-anchor": "start", "font-size": 16, "font-family": "Arial, Helvetica, sans-serif" });
		}
		tuttiGliElementi.push(testuale);
		
		//disegna connettore se c'e' padre
		if(father && father instanceof NodoGrafico) {
			nomiInfoAggiuntive
			_padre = father;
			var pathCoordinate = this.ottieniCoordinateCurva();
			/* vedere documentazione SVG per sintassi path, qui M indica il punto di partenza, C i due punti dove deve passare la curva e poi il punto di fine.
				alla fine setto la grandezza del tratto (stroke-width calcolato in base al logaritmo in base 10  del parametro row del nodo + 1 (non ho trovato una funzione nativa per cui logaritmo naturale di row diviso logaritmo naturale di 10)*/
			_connettore = canvas.createPath([["M", pathCoordinate[0][0], pathCoordinate[0][1]], ["C", pathCoordinate[1][0], pathCoordinate[1][1], pathCoordinate[1][2], pathCoordinate[1][3], pathCoordinate[0][2], pathCoordinate[0][3]]]).attr({stroke: "black", "stroke-width": Math.round(Math.log(_infoLogiche.getValRow())/Math.log(10)+ 1)});
			_connettore.toBack(); //per evitare che si sovrapponga ad altro
		}
		
		//disegna rettangolo che contiene le informazioni
		var infoDisegnate = new MostraInfo();
		var iconInfoDisegnate = canvas.createImage(percorsoImmagini + "info.png", origX + larghezza - (dimIcone + 5), origY + dimIcone + 10, dimIcone, dimIcone, 0);
		tuttiGliElementi.push(iconInfoDisegnate);
		//mouseover fornito da Raphael non funziona molto bene, si utilizza la funzionalita' standard onmouseover
		iconInfoDisegnate.node.onmouseover = function() {
			if(!(infoDisegnate.isDrawed())) { //disegno le informazioni solo se infoDisegnate non e' disegnato e le mostro non oscurando l'informazione sul colore
				infoDisegnate.crea(_infoLogiche.getNomiProprieta(), _infoLogiche.getProprieta(), _canvas, Math.round(_contenitore.attr("x") + 0.75*_contenitore.attr("width")), _contenitore.attr("y") + dimIcone + 10);
			}
		}
		if(_padre) {// la radice non puo' essere ridisegnata né drag (sarebbe ridondante con il pan
			//icona per il drag
			var iconDrag = canvas.createImage(percorsoImmagini + "dragOff.png", origX + 10, origY + altezza - (dimIcone + 5), dimIcone, dimIcone).attr({'title':'Sposta il sottoalbero o singolo nodo'});       
			tuttiGliElementi.push(iconDrag);
			iconDrag.pair = tuttiGliElementi;
			var outerThis = this; // all'interno delle funzioni lo scope cambia
			associaDrag(iconDrag, outerThis);
			
			_iconReDraw = canvas.createImage(percorsoImmagini + "mostraSottoAlbero.png", origX + 10, origY + altezza - (2*(dimIcone) + 10), dimIcone, dimIcone).attr({'title':'Considera sotto albero'});
			_iconReDraw.node.canPan = false; //il bottone per nascondere i figli non abilita il pan
			iconDrag.pair.push(_iconReDraw);
			_iconReDraw.node.onclick = function () {
				reDrawFunction(outerThis); // def funzione in fondo
			}
			
		}
	}
	//fine init
	
	//metodi get
	this.getRadice = function () {
		if(!_padre) {
			return this;
		}
		else {
			return _padre.getRadice();
		}
	}
	
	//ritorna il primo antenato su cui e' stata invocata la funzione reDrawFunction, se no la radice
	this.getFirstAncientRedraw = function () {
		if(!_padre) {
			return this;
		}
		else if(_isReDraw) {
			return this;
		}
		else {
			return _padre.getFirstAncientRedraw();
		}
	}
	
	this.getPadre = function() {
		return _padre;
	}
	
	//ritorna il nodo nella posizione n, se n > _figli.length o non e' un numero ritorna l'ultimo, se non ci sono figli null
	this.getFiglio = function(n) {
		if(_figli && typeof n == "number" && n >= 0 && n < _figli.length) {
			return _figli[n];
		}
		else {
			if(_figli) {
				return _figli[_figli.length - 1];
			}
			return null;
		}
	}
	
	//ritorna il numero dei figli del nodo
	this.getHowManyChild = function() {
		if(_figli) {
			return _figli.length;
		}
		else {
			return 0;
		}
	}

	this.getPuntoX = function () { // ritorna il punto x di _contenitore
		return _contenitore.attr("x");
	}
	
	this.getLarghezza = function () {
		return _contenitore.attr("width");
	}
	
	this.getPuntoY = function () { // ritorna il punto y di _contenitore
		return _contenitore.attr("y");
	}
	
	this.getAltezza = function () {
		return _contenitore.attr("height");
	}
	
	this.hasHiddenChild = function() {
		return _hasHideSubTree;
	}
	
	//ritorna la larghezza massima del sottoalbero N.B. Non e' la sola larghezza del sottoalbero, ma la larghezza di quest'ultimo piiù la distanza da (0,0)
	this.getLarghezzaSubTree = function () {
		var maxWidth = this.getPuntoX() + this.getLarghezza();
		if(_figli) { //chiamata ricorsiva per ottenere la larghezza massima dei figli, non posso assuemere che i figli siano più a a destra del padre, la struttura puo' essere stata manipolata
			for(var i = 0; i < _figli.length; ++i) {
				var widthFromChild = _figli[i].getLarghezzaSubTree();
				if(widthFromChild > maxWidth) {
					maxWidth = widthFromChild;
				}
			}
		}
		return maxWidth;
	}
	
	//ritorna l'altezza massima del sottoalbero. N.B. Non e' la sola altezza del sottoalbero, ma l'altezza di quest'ultimo più la distanza da (0,0)
	this.getAltezzaSubTree = function () {
		var maxHeight = this.getPuntoY() + this.getAltezza();
		if(_figli) { //chiamata ricorsiva per ottenere l'altezza massima dei figli, non posso assuemere che i figli siano più in basso del padre, la struttura puo' essere stata manipolata
			for(var i = 0; i < _figli.length; ++i) {
				var heightFromChild = _figli[i].getAltezzaSubTree();
				if(heightFromChild > maxHeight) {
					maxHeight = heightFromChild;
				}
			}
		}
		return maxHeight;
	}
	
	//ritorna la coordinata x più piccola del sottoalbero
	this.getMinWidthSubTree = function () {
		var minWidth = this.getPuntoX();
		if(_figli) { //chiamata ricorsiva per ottenere l'altezza massima dei figli, non posso assuemere che i figli siano più in basso del padre, la struttura puo' essere stata manipolata
			for(var i = 0; i < _figli.length; ++i) {
				var widthFromChild = _figli[i].getMinWidthSubTree();
				if(widthFromChild < minWidth) {
					minWidth = widthFromChild;
				}
			}
		}
		return minWidth;
	}
	
	//ritorna la coordinata y più piccola
	this.getMinHeightSubTree = function () {
		var minHeight = this.getPuntoY();
		if(_figli) { //chiamata ricorsiva per ottenere l'altezza massima dei figli, non posso assuemere che i figli siano più in basso del padre, la struttura puo' essere stata manipolata
			for(var i = 0; i < _figli.length; ++i) {
				var heightFromChild = _figli[i].getMinHeightSubTree();
				if(heightFromChild < minHeight) {
					minHeight = heightFromChild;
				}
			}
		}
		return minHeight;
	}
	//fine metodi get	
	
	//Metodi di spostamento del nodo, divisi in spostamento coordinata x e y. Ogni metodo si occupa di aggiornare i connettori del nodo stesso e dei figli se presenti
	this.setX = function (newX) {
		if(typeof newX == "number") {
			if(_contenitore) {
				var differenzaOldNewPosition = newX - _contenitore.attr("x"); //differenza in quanto i singoli elementi del nodo hanno coordinate diverse, ma vanno spostati della stessa quantita'
				if(differenzaOldNewPosition != 0) {
					for(var i = 0; i < _contenitore.pair.length; ++i) {
						_contenitore.pair[i].attr({x: _contenitore.pair[i].attr("x") + differenzaOldNewPosition});
					}
					if(_padre) {
						this.aggiornaConnettore();
					}
					if(_figli) {
						for(var i = 0; i < _figli.length; ++i) {
							_figli[i].aggiornaConnettore();
						}
					}
				}
			}
		}
	}
	
	this.setY = function(newY) {
		if(typeof newY == "number") {
			if(_contenitore) {
				var differenzaOldNewPosition = newY - _contenitore.attr("y");
				if(differenzaOldNewPosition != 0) {
					for(var i = 0; i < _contenitore.pair.length; ++i) {
						_contenitore.pair[i].attr({y: _contenitore.pair[i].attr("y") + differenzaOldNewPosition});
					}
					if(_padre) {
						this.aggiornaConnettore();
					}
					if(_figli) {
						for(var i = 0; i < _figli.length; ++i) {
							_figli[i].aggiornaConnettore();
						}
					}
				}
			}
		}
	}
	
	//sposta i figli di una certa quantita', richiamando sui figli setX e setY
	this.spostaFigli = function(dx, dy) {
		if(_figli) {
			for(var i = 0; i < _figli.length; ++i) {
				_figli[i].setX(_figli[i].getPuntoX() + dx);
				_figli[i].setY(_figli[i].getPuntoY() + dy);
				if(_figli[i].getFiglio(0)) {
					_figli[i].spostaFigli(dx, dy);
				}
			}
		}
	}
	
	//aggiorna il connettore
	this.aggiornaConnettore = function() {
		if(_padre != null) {
			var pathCoordinate = this.ottieniCoordinateCurva();
			_connettore.attr({path: [["M", pathCoordinate[0][0], pathCoordinate[0][1]], ["C", pathCoordinate[1][0], pathCoordinate[1][1], pathCoordinate[1][2], pathCoordinate[1][3], pathCoordinate[0][2], pathCoordinate[0][3]]]});
		}
	}
	
	//associa le funzioni di drag. outerThis serve all'interno delle singole funzioni
	var associaDrag = function (iconDrag, outerThis) {
		iconDrag.node.canPan = false;
		var dxIterazionePrecedente = 0,
		dyIterazionePrecedente = 0,
		start = function () {
			//N.B. attr("x") non esiste per le figure come ellissi o cerchi. Recuperare cx aggiungendo un controllo sul tipo dell'oggetto
			for(var i = 0; i < iconDrag.pair.length; ++i) {
				iconDrag.pair[i].ox = iconDrag.pair[i].attr("x");
				iconDrag.pair[i].oy = iconDrag.pair[i].attr("y");
			}
			//cambio per mostrare che il drag e' in funzione
			iconDrag.attr({ "src": percorsoImmagini + "dragOn.png"});
		},
		move = function (dx, dy) {
			for(var i = 0; i < iconDrag.pair.length; ++i) {
				iconDrag.pair[i].attr({x: iconDrag.pair[i].ox + dx, y: iconDrag.pair[i].oy + dy});
			}
			outerThis.aggiornaConnettore();
			if(_figli) { //se ci sono figli sposto anche loro
			
				/* ai figli passo sempre la differenza tra lo spostamento precedente e quello attuale, all'interno di un drag completo. 
				non posso passare direttamente dx o dy, perché fino al termine del drag continua ad aumentare */
				outerThis.spostaFigli(dx - dxIterazionePrecedente, dy - dyIterazionePrecedente);
				dxIterazionePrecedente = dx;
				dyIterazionePrecedente = dy;
			}
		},
		end = function() { 
			//riporto a zero questi valori, al prossimo drag continueranno a memorizzare lo scarto corretto
			dxIterazionePrecedente = 0;
			dyIterazionePrecedente = 0;
			
			//ripristino l'immagine del drag corretta
			iconDrag.attr({ "src": percorsoImmagini + "dragOff.png"});
		};
		iconDrag.drag(move, start, end);
	}
	//fine parte spostamento
	
	//aggiungi figli, se e' il primo figlio aggiungo anche la funzionalita' per nascondere/mostrare i figli
	this.addFiglio = function (figlio) {
		if(figlio instanceof NodoGrafico) {
			if(!_figli) { // parte eseguita se e' il primo figlio aggiunto
				_figli=[];
				var outerThis = this; //memorizzo il riferimento this, all'interno delle funzioni this = window e non l'oggetto
				//hide del sottoalbero
				_hideButton = _canvas.createImage(percorsoImmagini + "hideTree.png", this.getPuntoX() + dimIcone + 15, this.getPuntoY() + this.getAltezza() - (dimIcone + 5), dimIcone, dimIcone);
				_hideButton.node.canPan = false; //il bottone per nascondere i figli non abilita il pan
				_hideButton.insertAfter(_contenitore); // in questo modo il bottone e' esattamente dopo il "livello" del _contenitore. Se ci sposto sopra un figlio rimane oscurato dal figlio 
				_hideButton.attr({'title':'Nascondi Figli'})
				_contenitore.pair.push(_hideButton);
				_hideButton.node.onclick = function() {
					outerThis.hideShowFigli(_hasHideSubTree);
					_hasHideSubTree = !_hasHideSubTree;
					if(!_hasHideSubTree) {
						_hideButton.attr({'title':'Nascondi Figli',  "src": percorsoImmagini + "hideTree.png"});
					}
					else {
						_hideButton.attr({'title':'Mostra Figli', "src": percorsoImmagini + "mostraChild.png"});
					}
				}
			}
			//aggiungo il figlio
			_figli.push(figlio);
		}	
	}
	
	/*funzioni delete. Si cancella solo la parte logica, la parte grafica viene eliminata da invocazione di clear sul canvas
	cancellazione albero */
	this.deleteTree = function () {
		var radice;
		if(_padre) {
			radice = this.getRadice();
		}
		else {
			radice = this;
		}
		radice.deleteSubTree();
	}
	
	//cancellazione sottoAlbero
	this.deleteSubTree = function () {
		while (_figli && _figli.length > 0) {
			_figli[_figli.length - 1].deleteSubTree();
			_figli.pop();
		}

		while(_contenitore.pair.length > 1) {
			_contenitore.pair[_contenitore.pair.length - 1].remove();
			_contenitore.pair.pop();
		}
		_contenitore.pair[0].remove(); //pair[0] e' contenitore, di conseguenza non devo fare il pop.
		
		if(_padre) {
			_connettore.remove();
		}
		_padre = null;
		_infoLogiche = null;
	}
	
	/* Inizio parte per hide 
	Nasconde o mostra i figli sottostanti
	 nascondiMostra = false nascondi i figli, altrimenti mostra (true) */
	this.hideShowFigli = function (nascondiMostra) {
		if(_figli) {
			for(var i = 0; i < _figli.length; ++i) {
				if(!(nascondiMostra && _figli[i].hasHiddenChild())) {
					_figli[i].hideShowFigli(nascondiMostra);
					}
				
				_figli[i].hideShow(nascondiMostra, nascondiMostra);
			}
		}
	}
	
	//nasconde o mostra se stesso, false nasconde, true mostra. nascondiMostraConnettore e' per il connettore
	this.hideShow = function (nascondiMostra, nascondiMostraConnettore) {
		if(!nascondiMostra) {
			if(_padre && !nascondiMostraConnettore) {
				_connettore.hide();
			}
			for(var i = 0; i < _contenitore.pair.length; ++i) {
				_contenitore.pair[i].hide();
			}
		}
		else {
			if(_padre && nascondiMostraConnettore) {
				_connettore.show();
			}
			for(var i = 0; i < _contenitore.pair.length; ++i) {
				_contenitore.pair[i].show();
			}
		}
	}
	//fine parte della gestione di hide
	
	/* funzione per controllare se un fratello sinistro passa sopra il connettore di un certo nodo.
		figlio e' il nodo da controllare
		posto e' il posto dove controllare. Per ora implementato solo up
	*/
	this.controllaSpazio = function  (figlio, posto) {
		if(!_figli || _figli.length == 0) {
			return false;
		}
		
		var i = 0;
		while(_figli[i] !== figlio && _figli.length > i) {
			++i;
		}
		if(i == 0) {
			//non ha fratelli sinistri
			return false;
		}
		//ho l'indice del nodo oppure sono arrivato alla fine dell'array, ovvero il nodo figlio non e' ancora stato aggiunto perché sto disegnando l'albero e non facendo drag
		--i; //indice del fratello
		
		switch(posto) {
			case "up": 
				//se non e' sopra al nodo ritorno
				if(! (_figli[i].getPuntoY() < figlio.getPuntoY())) {
					return false;
				}
				// il fratello sinistro e' tra i punti dove parte e finisce il connettore del nodo al padre 
				if(_figli[i].getPuntoX() < figlio.getPuntoX() + figlio.getLarghezza()/2 &&  _figli[i].getPuntoX() > this.getPuntoX() + this.getLarghezza()/2) {
					return true;
				}
				return false;
				break;
			default:
				return false;
		}
	}
	
	/* Parte per calcolo coordinate connettore, solo i punti di aggancio. NON altri punti del path. 
	   x punto orgine del padre sull'asse x, y punto origine padre sull'asse y, a punto orgine del figlio sull'asse x, b punto origine padre sull'asse y,
	 Questa funzione assegna le coordinate xy e ab in base alle loro posizioni, all'altezza e alla larghezza delle figure. Ci sono 6 casi */
	var calcoloCoordinate = function(x, y, a, b, altezzaXY, altezzaAB, larghezzaXY, larghezzaAB) {
		var coordToReturn = [];
		
		//entro quando il figlio e' in un "corridoio" alto come due nodi e sette decimi figli. Scelta arbitraria in base all'output grafico dell'albero
		if ((y - b <= altezzaAB*1.2 && y >= b) || (y <=b && b - y < altezzaAB*1.5)){
			//ramo if: collego sotto-sopra e non destra - sinistra, in quanto il punto di collegamento a sinistra/destra del padre sarebbe prima del punto di collegamento destro/sinistro del figlio
			if((x >= a && a + larghezzaAB >= x) || (a > x && x + larghezzaXY > a)) { // N.B. per risparmiare righe di codice si puo' fare un'unica condizione if con if padre ma sarebbe poco chiaro
				if(b > y) { //il padre e' sopra
					coordToReturn.push(y + altezzaXY);
					coordToReturn.push(x + larghezzaXY/2);
					coordToReturn.push(b);
					coordToReturn.push(a + larghezzaAB/2);
				}
				else {
					coordToReturn.push(y);
					coordToReturn.push(x + larghezzaXY/2);
					coordToReturn.push(b + altezzaAB);
					coordToReturn.push(a + larghezzaAB/2);
				}	
			}
			else {
				if(x > a) { //il padre e' a destra
					coordToReturn.push(y + altezzaXY/2);
					coordToReturn.push(x);
					coordToReturn.push(b + altezzaAB/2);
					coordToReturn.push(a + larghezzaAB);
					
				} 
				else {
					coordToReturn.push(y + altezzaXY/2);
					coordToReturn.push(x + larghezzaXY);
					coordToReturn.push(b + altezzaAB/2);
					coordToReturn.push(a);
				}	
			}
		} 
		else { 
			if(b > y) { //il padre e' sopra
				coordToReturn.push(y + altezzaXY);
				coordToReturn.push(x + larghezzaXY/2);
				coordToReturn.push(b);
				coordToReturn.push(a + larghezzaAB/2);
			}
			else {
				coordToReturn.push(y);
				coordToReturn.push(x + larghezzaXY/2);
				coordToReturn.push(b + altezzaAB);
				coordToReturn.push(a + larghezzaAB/2);
			}
		}  
		return coordToReturn;
	}

	//ottengo tutte le coordinate che mi servono per disegnare la curva. qui scelta arbitraria, se non c'e' spazio sopra si sposta il punto di collegamento al figlio a sinistra
	this.ottieniCoordinateCurva = function () {
			var puntoAggancioPadreX, //da dove parte il connettore punto x
			puntoAggancioPadreY, //da dove parte il connettore punto y
			baseAggancioFiglioX = _contenitore.attr("x"), 
			baseAggancioFiglioY = _contenitore.attr("y"),
			puntoAggancioFiglioX, //dove si connette, punto x
			puntoAggancioFiglioY, //dove si connette, punto y
			yPadre = _padre.getPuntoY(),
			xPadre = _padre.getPuntoX(),
			altezzaPadre = _padre.getAltezza(),
			larghezzaPadre = _padre.getLarghezza(),
			altezza = _contenitore.attr("height"),
			larghezza = _contenitore.attr("width"),
			ax, // punto x della prima curva del connettore
			bx, // punto x della seconda curva del connettore
			ay, // punto y della prima curva del connettore
			by; // punto y della seconda cuva del connettore

			var coordinate = [];
			coordinate = calcoloCoordinate(xPadre, yPadre, baseAggancioFiglioX, baseAggancioFiglioY, altezzaPadre, altezza, larghezzaPadre, larghezza);
			puntoAggancioPadreY = coordinate[0];
			puntoAggancioPadreX = coordinate[1];
			puntoAggancioFiglioY = coordinate[2];
			puntoAggancioFiglioX = coordinate[3];
			
			 //e' collegato sopra, e controllo che abbia spazio. Se controllaSpazio restituisce true sposto il punto di collegamento a sinistra
			if(puntoAggancioFiglioX == baseAggancioFiglioX + larghezza/2 && puntoAggancioFiglioY == baseAggancioFiglioY && _padre.controllaSpazio(this, "up")) {
				puntoAggancioFiglioY = baseAggancioFiglioY + altezza/2;
				puntoAggancioFiglioX = baseAggancioFiglioX;
			}
			
			//distanza tra punto x dove arriva al figlio e punto di aggancio al padre
			var differenzaXPadreFiglio = puntoAggancioFiglioX - puntoAggancioPadreX; 
			 //distanza tra punto y dove arriva al figlio e punto di aggancio al padre
			var differenzaYPadreFiglio = puntoAggancioFiglioY - puntoAggancioPadreY;
			
			//calcolo punti coordinate delle x delle curve del connettore. N.B. non essendo valore assoluto differenzaXPadreFiglio non devo capire se e' a destra o a sinistra
			if(differenzaXPadreFiglio == 0) { //il figlio e' sulla stessa linea del padre
				ax = puntoAggancioPadreX;
				bx = puntoAggancioFiglioX;
			}
			else { //sommo un ottavo della differenza al padre e sottraggo un ottavo della differenza al figlio.
				ax = Math.round(puntoAggancioPadreX + differenzaXPadreFiglio/8);
				bx = Math.round(puntoAggancioFiglioX - differenzaXPadreFiglio/8);
			}
			
			//calcolo punti coordinate delle y delle curve del connettore. N.B. non essendo valore assolute differenzaYPadreFiglio non devo capire se e' sopra o sotto
			if (differenzaYPadreFiglio == 0) { //il figlio e' sulla stessa linea del padre
				ay = puntoAggancioPadreY;
				by = puntoAggancioFiglioY;
			}
			else { //sommo un terzo della differenza al padre e sottraggo un terzo della differenza al figlio.
				ay = Math.round(puntoAggancioPadreY + differenzaYPadreFiglio/3);
				by = Math.round(puntoAggancioFiglioY - differenzaYPadreFiglio/3);
			}
			
			// memorizzo in un array e restituisco
			var coordinatePerPath = new Array();
			for (i=0; i <2; i++) {
				coordinatePerPath[i]=new Array();
			}
			coordinatePerPath[0][0] = puntoAggancioPadreX;
			coordinatePerPath[0][1] = puntoAggancioPadreY;
			coordinatePerPath[0][2] = puntoAggancioFiglioX;
			coordinatePerPath[0][3] = puntoAggancioFiglioY;
			coordinatePerPath[1][0] = ax;
			coordinatePerPath[1][1] = ay;
			coordinatePerPath[1][2] = bx;
			coordinatePerPath[1][3] = by;
			
			return coordinatePerPath;
	}
	//fine parte ottenimento coordinate curve
	
	// funzione per nascondere l'albero, spostare il sottoalbero in cima e poi mostrare solo quest'ultimo
	var reDrawFunction = function(outerThis) {
	
		if(!_isReDraw) {
			//trovo il primo nodo ridisegnato (se non ce ne sono e' la radice) e nascondo il sottoalbero di quest'ultimo.
			var padreReDraw = outerThis.getFirstAncientRedraw();
			padreReDraw.hideShowFigli(false);
			padreReDraw.hideShow(false, false);
 
			if(!_hasHideSubTree) { 
				outerThis.hideShowFigli(true); //mostro i figli
			}
			outerThis.hideShow(true, false); //mostro se stesso

			//ridimensiono il canvas in modo che sia grande come il sottoalbero
			// _canvas.resizeCanvas(outerThis.getLarghezzaSubTree() + 10, outerThis.getAltezzaSubTree() + 10);
			_iconReDraw.attr({'title':'Considera sottoalbero superiore',  "src": percorsoImmagini + "mostraAlbero.png"});
			_iconReDraw.node.onclick = function () {
				riMostraSottoAlberoPrecedente(outerThis); // def funzione in fondo
			}
			_isReDraw = true;
		}
	}
	
	//questa funzione mostra il sottoalbero del primo padre "ridisegnato"
	var riMostraSottoAlberoPrecedente = function (outerThis) {
		if (_isReDraw && _padre) { //il nodo dev'essere ridisegnato e non dev'essere la radice 
			outerThis.hideShowFigli(false); //nascondo i figli
			outerThis.hideShow(false, false); //nascondo se stesso
			
			var padreReDraw;
			padreReDraw = _padre.getFirstAncientRedraw(); //cerco il primo padre che e' stato ri-disegnato oppure arrivo alla radice
			
			_iconReDraw.attr({'title':'Considera sotto albero',  "src": percorsoImmagini + "mostraSottoAlbero.png"});
			_iconReDraw.node.onclick = function () {
				reDrawFunction(outerThis); // def funzione in fondo
			}
			
			padreReDraw.hideShowFigli(true);
			padreReDraw.hideShow(true, false); //del nodo non mostro l'eventuale connettore al padre
			
			//ridimensiono il canvas in modo che sia grande come il sottoalbero del primo padre ri-disegnato
			// _canvas.resizeCanvas(padreReDraw.getLarghezzaSubTree() + 10, padreReDraw.getAltezzaSubTree() + 10); 
			_isReDraw = false;
		}
	}
}