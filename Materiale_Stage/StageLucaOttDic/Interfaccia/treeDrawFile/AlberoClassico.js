/*
Dipendenze:
NodoGrafico

Eredita:
alberoBase

Descrizione: Disegna un albero con elementi di tipo nodoGrafico in modo tale che:
tutti i nodi ad un certo livello siano allineati
I nodi del livello superiore siano centrati rispetto ai nodi del propprio sottoalbero, ma solo se > 2

Metodi:
creaFigli,
creaRadiceClassico.

Membri:
this.inheritFrom. Riferimento alla superclasse
*/
function alberoClassico () {
	//chiamata al costruttore della super classe alberoBase
	this.inheritFrom = alberoBase;
	this.inheritFrom();
	/*
	Disegna un albero classico, dove ogni nodo padre e' diviso a meta' dall'ipotetico asse di simmetria passante per il sottoalbero
	profondita, a che profondita si e'
	figli, sono i nodi da disegnare, sono dati in formato JSON
	padre e' il padre dei figli ed e' di tipo NodoGrafico
	canvas e' l'oggetto di tipo RaphaelAdapter da passare agli oggetti di tipo nodoGrafico
	offset, e' la coordinata minima x a cui si può disegnare un nodo di quel livello. all'ultima iterazione diventa lo spazio occupato in x dal livello
	nodiCreati, array con i riferimenti a tutti i nodi creati. N.B. Non sarebbe indispensabile, ma senza quando si tratta di "correggere" la profondita' dei vari livelli la complessita' algoritmica aumenta troppo.
	dimspostamento: la dimensione con cui devo spostare lungo lo stesso livello
	return: lo spazio occupato sull'asse per il disegno da tutti i nodi più i fratelli 
	*/
	this.creaFigli = function (profondita, figli, padre, canvas, offset, nodiCreati, dimSpostamento) {
		var coord = padre.getPuntoY() + padre.getAltezza()*1.6; //altezza, non viene mai alterata

		var noFigliBrother = false; // viene messa a false se il nodo non ha figli, all'iterazione successiva il fratello destro controlla se il fratello sinistro non ha figli.
		var spostatoBrother = false; //viene messo a true se il nodo viene spostato, all'iterazione successiva il fratello destro  controllera' se il fratello sinistro e' stato spostato
		var halfSpostatoBrother = false; //viene messo a true se il nodo viene spostato ma a meta', non della dimensione di un nodo
		if(!nodiCreati[profondita]) {
			nodiCreati[profondita] = new Array();
		}
		for(var i=0; i < figli.length; ++i) {
			
			var arrKeyProp = this.rimuoviNonInformazioni(figli[i]);

			//creo un array con i valori delle proprieta non eliminate
			var arrValueProp = [];
			for(var j = 0; j < arrKeyProp.length; ++j) {
				arrValueProp.push(figli[i][arrKeyProp[j]]);
			}
			
			//c'e' almeno un nodo dello stesso livello gia' creato
			if(nodiCreati[profondita][nodiCreati[profondita].length - 1] && i>0) {
				if((nodiCreati[profondita][nodiCreati[profondita].length - 1].getHowManyChild() > 1) && !(figli[i].figli && figli[i].figli.length > 0)) { //il fratello ha due o più figli e questo nodo non ha figli, posso spostarmi
					
					if(nodiCreati[profondita][nodiCreati[profondita].length - 1].getHowManyChild() > 2) { //se ne ha come minimo 3 posso spostarmi dell'intera grandezza del nodo
						offset =  offset - (dimSpostamento + this._spazioStandard);
						halfSpostatoBrother = false;
						spostatoBrother = true;
					}
					else { // altrimenti meta', il fratello ha 2 figli (se no sarei nel ramo else del secondo if
						offset =  offset - (dimSpostamento + this._spazioStandard)/2;
						halfSpostatoBrother = true;
						spostatoBrother = false;
					}
					
				} else if(!(figli[i].figli && figli[i].figli.length > 0)) { //non sono andato nel ramo if non perché il nodo non ha figli, ma perché il fratello non ha 2 o più figli
					spostatoBrother = false;
					halfSpostatoBrother = false;
				}
			}
			//creo nodo
			nodiCreati[profondita].push(new NodoGrafico());
			//la differenza tra le due chiamate e' che l'offset e' passato come punto x nel primo caso e punto y nel secondo
			nodiCreati[profondita][nodiCreati[profondita].length - 1].init(figli[i].nome, figli[i].color, arrValueProp, arrKeyProp, offset, coord, this._lunghezzaNodoStandard, this._altezzaNodoStandard, canvas, padre);
			
			padre.addFiglio(nodiCreati[profondita][nodiCreati[profondita].length -1]);
			
			//chiamate ricorsive sui figli se ci sono e lo spazio occupato dal proprio sottoalbero e' >= dello spazio occupato dal nodo
			if(figli[i].figli && figli[i].figli.length > 0) {
				/*ramo if: il fratello non aveva figli, c'e' più spazio per un nodo che ha più di due figli, inoltre i fratello non e' stato spostato e quindi lo spazio c'e' */
				if(figli[i].figli.length > 2 && noFigliBrother && !spostatoBrother) {
					if(halfSpostatoBrother) { //stabilisco se il fratello si e' spostato di meta' o no.
						offset = this.creaFigli(profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset - (dimSpostamento + this._spazioStandard)/2, nodiCreati, dimSpostamento);
					}
					else {
						offset = this.creaFigli(profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset - (dimSpostamento + this._spazioStandard), nodiCreati, dimSpostamento);
					}
				} /*ramo else if : il fratello non aveva figli per cui ho meta' grandezza nodo per i figli (il nodo ha due figli, se fossero tre sarebbe nel primo ramo se non ne avesse nel terzo)*/ 
				else if(figli[i].figli.length > 1 && noFigliBrother && !spostatoBrother) {
					offset = this.creaFigli(profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset - ((dimSpostamento + this._spazioStandard)/2), nodiCreati, dimSpostamento);
				}
				else { 
					//ho almeno un figlio, ma se sono più di due non posso sfruttare dello spazio perché anche il fratello sinistro aveva figli, oppure e' il primo nodo del livello
					offset = this.creaFigli(profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset, nodiCreati, dimSpostamento);
				}
				noFigliBrother = false; //il nodo in questione ha dei figli
				spostatoBrother = false; //un nodo con figli non può essere spostato
			}
			else { //non ci sono figli
				noFigliBrother = true;  //non ha figli
				offset += dimSpostamento + this._spazioStandard;
			}
			
			//quando sono qui il nodo e i suoi figli sono stati disegnati
			if(nodiCreati[profondita][nodiCreati[profondita].length - 1].getHowManyChild() > 0) { //ho più di due figli, centro il nodo
				var puntoXfiglioLeft = nodiCreati[profondita][nodiCreati[profondita].length - 1].getFiglio(0).getPuntoX();
				var puntoXfiglioRight = nodiCreati[profondita][nodiCreati[profondita].length - 1].getFiglio(nodiCreati[profondita][nodiCreati[profondita].length - 1].getHowManyChild()-1).getPuntoX() + this._lunghezzaNodoStandard + this._spazioStandard;
				//sposto il nodo in modo tale che l'ipotetico asse di simmetria del nodo dividi esattamente a meta' il sottoalbero
				nodiCreati[profondita][nodiCreati[profondita].length - 1].setX(puntoXfiglioLeft + (puntoXfiglioRight - puntoXfiglioLeft)/2 - (this._lunghezzaNodoStandard + this._spazioStandard)/2);
			}
		}
		return offset;
	}
	
	//primo step, disegno radice
	this.creaRadice = function(Json, canvas, lunghezza, altezza, spazioTraNodi) {
		if(!Json) { //Json vuoto
			return;
		}
		this._lunghezzaNodoStandard = lunghezza;
		this._altezzaNodoStandard = altezza;
		this._spazioStandard = spazioTraNodi;
		
		var arrKeyProp = this.rimuoviNonInformazioni(Json);
		
		//creo un array con i valori delle proprieta non eliminate
		var arrValueProp = [];
		for(var i = 0; i < arrKeyProp.length; ++i) {
			arrValueProp.push(Json[arrKeyProp[i]]);
		}
		
		this._padre = new NodoGrafico();
		this._padre.init(Json.nome, Json.color, arrValueProp, arrKeyProp, 10, 10, this._lunghezzaNodoStandard, this._altezzaNodoStandard, canvas, null);
		if(Json.figli) { //ci sono figli
			
			var allNode = [];
			this.creaFigli(0, Json.figli, this._padre, canvas, this._padre.getPuntoX(), allNode, this._lunghezzaNodoStandard);
			//correggo la posizione della radice considerando la posizione del figlio più a destra e quello più a sinistra. Infine sistemo la dimensione del canvas
			var puntoXfiglioLeft = this._padre.getFiglio(0).getPuntoX();
			var puntoXfiglioRight = this._padre.getFiglio(this._padre.getHowManyChild()-1).getPuntoX() + this._lunghezzaNodoStandard + this._spazioStandard;
			this._padre.setX(puntoXfiglioLeft + (puntoXfiglioRight - puntoXfiglioLeft)/2 - (this._lunghezzaNodoStandard + this._spazioStandard)/2);
		}
		//sistemo la dimensione del canvas se non supporta SVG
		if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
			canvas.resizeCanvas(this._padre.getLarghezzaSubTree() + 5 ,this._padre.getAltezzaSubTree() + 5);
		}
	}
}