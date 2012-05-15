/*
Dipendenze:
NodoGrafico

Descrizione: 
Parte comune per i vari algoritmi di disegno dell'albero. Una sorta di superclasse

metodi:
cancellaAlbero
getPadre
rimuoviNonInformazioni

Membri: //in questa classe sono accessibili dall'esterno
_lunghezzaNodoStandard;
_altezzaNodoStandard;
_spazioStandard;
_padre;
*/

function alberoBase () {
	this._lunghezzaNodoStandard;
	this._altezzaNodoStandard;
	this._spazioStandard;
	this._padre;
	
	//richiama sul nodo _padre la funzione per cancellare l'intero albero
	this.cancellaAlbero = function () {
		if(this._padre) {
			this._padre.deleteTree();
		}
	}
	
	this.getPadre = function () {
		return this._padre;
	}
	
	//tolgo dal singolo json le proprietà note e che non devono finire nelle informazioni aggiuntive
	this.rimuoviNonInformazioni = function (jSonToClean) {
		var arrKeyProp = new Array();

		for(var key in jSonToClean) {
			arrKeyProp.push(key);
		}
		var idx = arrKeyProp.indexOf("color");
		if(idx!=-1) {
			arrKeyProp.splice(idx, 1);
		}
		idx = arrKeyProp.indexOf("figli");
		if(idx!=-1) {
			arrKeyProp.splice(idx, 1);
		}
		return arrKeyProp;
	}
}