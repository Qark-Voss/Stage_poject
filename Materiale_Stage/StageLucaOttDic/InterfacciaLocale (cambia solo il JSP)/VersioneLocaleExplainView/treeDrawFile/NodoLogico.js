//funzione che prende una stringa e fa in modo che ogni parola cominci con la lettera grande se è composta da sole lettere grandi. Aggiunta alla classe String, non e' parte di NodoLogico
String.prototype.adjustLowerUpCase = function() { 
			
	var stringCapatilize = this;
	//separatore spazio
	var words = stringCapatilize.split(" ");
	for(var i = 0; i < words.length; ++i) {
		if(words[i].match(/^[A-Z]+$/)) {
			words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
		}
	}
	stringCapatilize = words.join(" ");
	
	//separatore -
	words = stringCapatilize.split("-");
	for(var i = 0; i < words.length; ++i) {
		if(words[i].match(/^[A-Z]+$/)) {
			words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
		}
	}
	stringCapatilize = words.join("-");
	
	return stringCapatilize
}

/* 
Dipendenze:
Nessuna

Descrizione:
questa classe gestisce un nodo dal punto di vista delle informazioni

Metodi disponibili:
init, costruttore
----- metodi get -----
getNome
getColore
getProprieta
getNomiProprieta
getValRow

Membri:
_nome,
_colore,
_proprieta,
_nomiProprieta;
*/
function NodoLogico() {
	
	var _nome,
	_colore,
	_proprieta, // valori delle informazioni aggiuntive
	_nomiProprieta; //nomi delle informazioni aggiuntive
	
	//il costruttore controlla di ricevere i parametri di tipo corretto, che il valore delle proprieta e il loro nome siano in numero uguale
	this.init = function(nome, colore, proprieta, nomiProprieta) {
		if(typeof nome!="string" || typeof colore!="string") {
			alert("Nome o colore non sono stringhe!");
			return;
		}
		if(!(proprieta instanceof Array)) {
			alert("proprieta non \350 un array");
			return;
		}
		if(!(nomiProprieta instanceof Array)) {
			alert("nomiProprieta non \350 un array");
			return;
		}
		if(proprieta.length == 0) {
			alert("proprieta \350 vuoto");
			return;
		}
		if(nomiProprieta.length == 0) {
			alert("nomiProprieta \350 vuoto");
			return;
		}
		if(nomiProprieta.length != proprieta.length) {
			alert("I nomi delle propriet\340 e i loro valori sono in numero differente");
			return;
		}
		
		//Sistemo i vari valori
		_nome = nome.adjustLowerUpCase();
		switch(colore) {
			case "red": 
				_colore = "#ff0000";
				break;
			case "pink": 
				_colore = "#ff9966";
				break;
			case "yellow": 
				_colore = "#ffff00";
				break;
			case "green": 
				_colore = "#00CC00";
				break;
			case "blue": 
				_colore = "#0000ff";
				break;
			default : 
				_colore = "#e6e6e6";
		}
		_proprieta = proprieta;
		_nomiProprieta = nomiProprieta;
		
		//cambio etichetta di due proprieta, se si cambia lato server il nome farlo anche qui
		var idx = _nomiProprieta.indexOf("time");
		if(idx!= -1) {
			_nomiProprieta[idx] = "tempo impiegato";
		}
		else {
			alert("Un'operazione non ha il tempo associato");
		}
		idx = _nomiProprieta.indexOf("row");
		if(idx!= -1) {
			_nomiProprieta[idx] = "righe restituite";
		}
		else {
			alert("Un'operazione non ha il numero di righe associato");
		}
		
		//sposto il nome come primo elemento se non lo e' gia'
		idx = _nomiProprieta.indexOf("nome");
		if(idx == -1) {
			alert("Un'operazione non ha il valore di nome (nodoLogico)");
		}
		else if(idx != 0) {
			var scambio = _nomiProprieta[0];
			_nomiProprieta[0] = _nomiProprieta[idx];
			_nomiProprieta[idx] = scambio;
			scambio = _proprieta[0];
			_proprieta[0] = _proprieta[idx];
			_proprieta[idx] = scambio;
		}
		_proprieta[0] = _proprieta[0].adjustLowerUpCase(); //il primo e' sempre il nodo
		
		for(var i = 0; i < _proprieta.length; ++i) { //pulisco le informazioni
			_proprieta[i] = _proprieta[i].toString().trim();
		}
	}
	
	this.getNome = function() {
		return _nome;
	}
	
	this.getColore = function() {
		return _colore;
	}
	
	this.getProprieta = function() {
		return _proprieta;
	}
	
	this.getNomiProprieta = function() {
		return _nomiProprieta;
	}
	
	//restituisce il valore della proprieta' row. Ogni operazione ha row.
	this.getValRow = function () {
		var idx =_nomiProprieta.indexOf("righe restituite");
		if(idx == -1) {
			alert("Un'operazione non ha righe restituite");
			return;
		}
		return _proprieta[idx];
	}
}