/*
Dipendenze:
NodoGrafico

Eredita:
alberoBase

Descrizione: Disegna un albero con elementi di tipo nodoGrafico in modo tale che:
tutti i nodi ad un certo livello siano incolonnati. Ad ogni aumento di profondita' il livello scende dell'altezza di un nodo
i fratelli sono distanziati tra di loro in altezza in base allo spazio occupato dal fratello sinistro.

Metodi:
creaFigli,
creaRadiceVerticale.

Membri:
this.inheritFrom. Riferimento alla superclasse
*/

function alberoVerticale() {
	//chiamata al costruttore della super classe alberoBase
	this.inheritFrom = alberoBase;
	this.inheritFrom();
	
	/*
	Disegna un albero verticale, dove ogni nodo ha a destra i figli e sotto/sopra i fratelli 
	figli, sono i nodi da disegnare, sono dati in formato JSON
	padre e' il padre dei figli ed e' di tipo NodoGrafico
	canvas e' l'oggetto di tipo RaphaelAdapter da passare agli oggetti di tipo nodoGrafico
	offset, e' la coordinata minima x a cui si può disegnare un nodo di quel livello. all'ultima iterazione diventa lo spazio occupato in x dal livello
	dimspostamento: la dimensione con cui devo spostare lungo lo stesso livello
	return: lo spazio occupato sull'asse per il disegno da tutti i nodi di quel livello
	*/
	this.creaFigli = function (profondita, figli, padre, canvas, offset, dimSpostamento) {

		var coord = padre.getPuntoX() + this._lunghezzaNodoStandard*1.25; // coord e' la coordinata x del nodo da disegnare. In questo albero un figlio e' sempre spostato di this._lunghezzaNodoStandard rispetto al padre
		for(var i=0; i < figli.length; ++i) {

			var arrKeyProp = this.rimuoviNonInformazioni(figli[i]);

			//creo un array con i valori delle proprieta non eliminate
			var arrValueProp = [];
			for(var j = 0; j < arrKeyProp.length; ++j) {
				arrValueProp.push(figli[i][arrKeyProp[j]]);
			}
			
			var newNodo = new NodoGrafico();

			newNodo.init(figli[i].nome, figli[i].color, arrValueProp, arrKeyProp, coord, offset, this._lunghezzaNodoStandard, this._altezzaNodoStandard, canvas, padre);
			padre.addFiglio(newNodo);
			// il nodo successivo (figlio o fratello) e' sotto rispetto a questo 
			offset += dimSpostamento;
			if(figli[i].figli) {
				offset = this.creaFigli(profondita + 1, figli[i].figli, newNodo, canvas, offset, dimSpostamento);
			}
			
		}
		return offset;
	}
	
	/*	primo step  qui creo la radice e inizializzo i membri della classe (che sono ereditati dalla superclasse)
		Json, contiene i dati
		canvas, l'oggetto di tipo RaphaelAdapter da passare alle istanze di NodoGrafico
	*/
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
		
		if(!Json.figli) { //non ci sono figli
			return;
		}
		
		this.creaFigli(0, Json.figli, this._padre, canvas, this._padre.getPuntoY() + this._padre.getAltezza()*1.5, this._altezzaNodoStandard*1.5);
		
		//sistemo la dimensione del canvas se non supporta SVG
		if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
			canvas.resizeCanvas(this._padre.getLarghezzaSubTree() + 5 ,this._padre.getAltezzaSubTree() + 5);
		}
	}
}