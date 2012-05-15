/*
Dipendenze:
NodoGrafico
RaphaelAdapter

Eredita:
alberoBase

Descrizione:
algoritmo per la creazione di un albero misto ovvero meta' viene disegnato verso il basso e meta' verso destra 

Metodi:
aggiustaLivelloVerticale <---- senza this.
aggiustaLivelloOrizzontale <---- senza this.
sistemaLivelli
ottimizzaSpazio
ottimizzaSpazioSinistra
ottimizzaSpazioDestra
creaFigli
calcoloNodiPerLivello <---- senza this.
creaRadice

Membri:
this.inheritFrom. Riferimento alla superclasse
*/
function albertoMisto() {
	//chiamata al costruttore della super classe alberoBase
	this.inheritFrom = alberoBase;
	this.inheritFrom();
	/*
	la funzione aumenta la coordinata y dei nodi del valore contenuto in "differenza"
	Dopo aver aumentato la coordinata y di un livello controlla che il livello sottostante non sia troppo vicino, nel caso aumenta coordinata y anche del livello sottostante
	profondita, livello del nodo N.B. La radice e' a profondita' -1
	differenza, l'aumento della coordinata y dei nodi richiesta
	nodiCreati, array con tutti i nodi creati
	*/
	var aggiustaLivelloVerticale = function (profondita, differenza, nodiCreati) {
		if(differenza <= 0) {
			return;
		}
		for(var i = 0; i < nodiCreati[profondita].length; ++i) {
			nodiCreati[profondita][i].setY(nodiCreati[profondita][i].getPuntoY() + differenza);
		}
		if(nodiCreati[profondita+1]) { //se c'e' un livello successivo
			differenza = nodiCreati[profondita][0].getPuntoY() + 1.6*nodiCreati[profondita][0].getAltezza() - nodiCreati[profondita+1][0].getPuntoY();
			if(differenza > 0) { //il livello sottostante e' distante meno di 0.6*altezza del nodo 
				aggiustaLivelloVerticale(profondita + 1, differenza, nodiCreati);
			}
		}
	}
	
	/*
	la funzione aumenta la coordinata x dei nodi del valore contenuto in "differenza"
	Dopo aver aumentato la coordinata x di un livello controlla che il livello sottostante non sia troppo vicino, nel caso aumenta la coordinata x anche del livello a destra
	profondita, livello del nodo N.B. La radice e' a profondita' -1
	differenza, l'aumento della coordinata x dei nodi richiesta
	nodiCreati, array con tutti i nodi creati
	*/
	var aggiustaLivelloOrizzontale = function (profondita, differenza, nodiCreati) {
		if(differenza <= 0) {
			return;
		}
		for(var i = 0; i < nodiCreati[profondita].length; ++i) {
			nodiCreati[profondita][i].setX(nodiCreati[profondita][i].getPuntoX() + differenza);
		}
		if(nodiCreati[profondita+1]) {  //se c'e' un livello successivo
			differenza = nodiCreati[profondita][0].getPuntoX() + 1.6*nodiCreati[profondita][0].getLarghezza() - nodiCreati[profondita+1][0].getPuntoX();
			if(differenza > 0) { //il livello sottostante e' distante meno dello 0.6*Larghezza del nodo
				aggiustaLivelloOrizzontale(profondita + 1, differenza, nodiCreati);
			}
		}
	}
	/*
	la funzione aggiusta l'altezza dei due sottoalberi, facendo in modo che nessuno dei due "sfori" nell'area dell'altro
		nodiSinistra, i nodi grafici della parte sinistra
		nodiDestra, i nodi grafici della parte destra
		angle, utilizzato per separare in due l'area di disegno
		profondita, livello dell'albero in cui si sta lavorando. N.B. La radice e' a profondita' -1
	*/
	this.sistemaLivelli = function(nodiSinistra, nodiDestra, angle, profondita) {
		if(nodiSinistra) {
			var nodoSinistroPiuADestra = nodiSinistra[profondita][nodiSinistra[profondita].length - 1];
			//calcolo la distanza dall'origine che dovrebbe rispettare il livello del sottoalbero se l'altro sottoalbero fosse pieno
			var altezzaSinistro = (nodoSinistroPiuADestra.getPuntoX()+nodoSinistroPiuADestra.getLarghezza()+this._spazioStandard)/Math.cos(angle)*Math.sin(angle);
			aggiustaLivelloVerticale(profondita, Math.round(altezzaSinistro - nodoSinistroPiuADestra.getPuntoY()), nodiSinistra);
		}
		if(nodiDestra) {
			var nodoDestroPiuInBasso = nodiDestra[profondita][nodiDestra[profondita].length - 1];
			var larghezzaDestro = (nodoDestroPiuInBasso.getPuntoY()+nodoDestroPiuInBasso.getAltezza())/Math.cos(Math.PI/2 - angle)*Math.sin(Math.PI/2 - angle);
			aggiustaLivelloOrizzontale(profondita, Math.round(larghezzaDestro - nodoDestroPiuInBasso.getPuntoX()+this._spazioStandard), nodiDestra);
		}
		if(nodiSinistra && nodiDestra && nodiSinistra[profondita+1] && nodiDestra[profondita+1]) { 
			this.sistemaLivelli(nodiSinistra, nodiDestra, angle, profondita+1);
		}
		else if(nodiSinistra && nodiSinistra[profondita+1]) {
			this.sistemaLivelli(nodiSinistra, null, angle, profondita+1);
		}
		else if(nodiDestra && nodiDestra[profondita+1]) {
			this.sistemaLivelli(null, nodiDestra, angle, profondita+1);
		}
	}
	
	/*
	Ottimizza lo spazio occupato dall'albero, permettendo ai singoli livelli di "sforare" nell'area dell'altro sottoalbero se possibile. 
	La funzione considera dei due livelli quali dei due e' più lontano dal livello precedente e cerca di spostare quello più distante
	*/
	this.ottimizzaSpazio = function(nodiSinistra, nodiDestra, profondita) {
		var nodoSinistroPiuADestra = nodiSinistra[profondita][nodiSinistra[profondita].length - 1];
		var nodoDestroPiuInBasso = nodiDestra[profondita][nodiDestra[profondita].length - 1];
		var padreSinistro = nodoSinistroPiuADestra.getPadre();
		var diffAltezzaSinistro = padreSinistro.getPuntoY() + 1.6*padreSinistro.getAltezza() - nodoSinistroPiuADestra.getPuntoY();
		var padreDestro = nodoDestroPiuInBasso.getPadre();
		var diffLarghezzaDestro = padreDestro.getPuntoX() + 1.6*padreDestro.getLarghezza() - nodoDestroPiuInBasso.getPuntoX();
		if(diffAltezzaSinistro < 0 || diffLarghezzaDestro < 0 ){ // ha senso cercare di ottimizzare spazio
			if(diffAltezzaSinistro <= diffLarghezzaDestro) { //sposto il livello più distante dal padre
				//calcolo la nuova altezza del livello
				var newPuntoY = nodoSinistroPiuADestra.getPuntoY() + diffAltezzaSinistro; //come minimo l'altezza puo' essere
				var i = 0;
				var controllatoCriticita = false;
				while(i < nodiDestra.length && !controllatoCriticita) {
					//un nodo del sottoalbero destro puo' sovrapporsi se la propria coordinata x e' inferiore alla coordinata x del nodo sinistro più la sua larghezza e lo spazio
					if(nodiDestra[i][nodiDestra[i].length - 1].getPuntoX() < nodoSinistroPiuADestra.getPuntoX() + nodoSinistroPiuADestra.getLarghezza() + this._spazioStandard) {
						//calcolo l'altezza del lvello del nodo
						var altezzaLivelloDestro = nodiDestra[i][nodiDestra[i].length - 1].getPuntoY() + nodiDestra[i][nodiDestra[i].length - 1].getAltezza() + this._spazioStandard*2; // spazio per 2 per distanziare
						if( altezzaLivelloDestro > newPuntoY ) {
							newPuntoY = altezzaLivelloDestro;
						}
						if(newPuntoY>= nodoSinistroPiuADestra.getPuntoY()) {
							controllatoCriticita = true;
						}
						++i;
					}
					else { //non ci sono altri livelli del sottoalbero destro che si possono sovrapporre
						controllatoCriticita = true;
					}
				}
				if(newPuntoY < nodoSinistroPiuADestra.getPuntoY()) {
					for(var i = 0; i < nodiSinistra[profondita].length; ++i) {
						nodiSinistra[profondita][i].setY(newPuntoY);
					}
				}
			}
			else {
				//calcolo la nuova larghezza del livello
				var newPuntoX = nodoDestroPiuInBasso.getPuntoX() + diffLarghezzaDestro; 
				var i = 0;
				var controllatoCriticita = false;
				while(i < nodiSinistra.length && !controllatoCriticita) {
					//un nodo del sottoalbero sinistro puo' sovrapporsi se la propria coordinata y e' inferiore alla coordinata y del nodo destro più l'altezza del nodo e lo spazio
					if(nodiSinistra[i][nodiSinistra[i].length - 1].getPuntoY() < nodoDestroPiuInBasso.getPuntoY() + nodoDestroPiuInBasso.getAltezza() + this._spazioStandard) {

						//calcolo la larghezza del lvello del nodo
						var larghezzaLivelloSinistro = nodiSinistra[i][nodiSinistra[i].length - 1].getPuntoX() + nodiSinistra[i][nodiSinistra[i].length - 1].getLarghezza() + this._spazioStandard*2; //spazio per 2 per distanziare
						if( larghezzaLivelloSinistro > newPuntoX ) {
							
							newPuntoX = larghezzaLivelloSinistro;
						}
						if(newPuntoX >= nodoDestroPiuInBasso.getPuntoX()) {
							controllatoCriticita = true;
						}
						++i;
					}
					else { //non ci sono altri livelli del sottoalbero destro che si possono sovrapporre
						controllatoCriticita = true;
					}
				}
				if(newPuntoX < nodoDestroPiuInBasso.getPuntoX()) {
					for(var i = 0; i < nodiDestra[profondita].length; ++i) {
						nodiDestra[profondita][i].setX(newPuntoX);
					}
				}
			}
		}
		if(nodiSinistra[profondita+1] && nodiDestra[profondita+1]) { //non ottimizzo i livelli se uno dei due sottoalberi non ha il livello successivo
			this.ottimizzaSpazio(nodiSinistra, nodiDestra, profondita+1);
		}
		else if(nodiSinistra[profondita+1] && !nodiDestra[profondita+1]) { //il sottoalbero sinistro e' più profondo
			this.ottimizzaSpazioSinistra(nodiSinistra, nodiDestra, profondita+1);
		}
		else if(!nodiSinistra[profondita+1] && nodiDestra[profondita+1]) {  //il sottoalbero destro e' più profondo
			this.ottimizzaSpazioDestra(nodiSinistra, nodiDestra, profondita+1);
		}
	}
	
	/*
	Versione della funzione precedente che cerca di ottimizzare solo il lato sinistro
	*/
	this.ottimizzaSpazioSinistra = function(nodiSinistra, nodiDestra, profondita) {
		var nodoSinistroPiuADestra = nodiSinistra[profondita][nodiSinistra[profondita].length - 1];
		var padreSinistro = nodoSinistroPiuADestra.getPadre();
		var diffAltezzaSinistro = padreSinistro.getPuntoY() + 1.6*padreSinistro.getAltezza() - nodoSinistroPiuADestra.getPuntoY();
		if(diffAltezzaSinistro < 0){ // ha senso cercare di ottimizzare spazio
			//calcolo la nuova altezza del livello
			var newPuntoY = nodoSinistroPiuADestra.getPuntoY() + diffAltezzaSinistro; //come minimo l'altezza puo' essere
			var i = 0;
			var controllatoCriticita = false;
			while(i < nodiDestra.length && !controllatoCriticita) {
				//un nodo del sottoalbero destro puo' sovrapporsi se la propria coordinata x e' inferiore alla coordinata x del nodo sinistro più la sua larghezza e lo spazio
				if(nodiDestra[i][nodiDestra[i].length - 1].getPuntoX() < nodoSinistroPiuADestra.getPuntoX() + nodoSinistroPiuADestra.getLarghezza() + this._spazioStandard) {
					//calcolo l'altezza del lvello del nodo
					var altezzaLivelloDestro = nodiDestra[i][nodiDestra[i].length - 1].getPuntoY() + nodiDestra[i][nodiDestra[i].length - 1].getAltezza() + this._spazioStandard*2; // spazio per 2 per distanziare
					if( altezzaLivelloDestro > newPuntoY ) {
						newPuntoY = altezzaLivelloDestro;
					}
					if(newPuntoY>= nodoSinistroPiuADestra.getPuntoY()) {
						controllatoCriticita = true;
					}
					++i;
				}
				else { //non ci sono altri livelli del sottoalbero destro che si possono sovrapporre
					controllatoCriticita = true;
				}
			}
			if(newPuntoY < nodoSinistroPiuADestra.getPuntoY()) {
				for(var i = 0; i < nodiSinistra[profondita].length; ++i) {
					nodiSinistra[profondita][i].setY(newPuntoY);
				}
			}
		}
		if(nodiSinistra[profondita+1]) {
			this.ottimizzaSpazioSinistra(nodiSinistra, nodiDestra, profondita+1);
		}
	}
	
	/*
	Versione della funzione precedente che cerca di ottimizzare solo il lato destro
	*/
	this.ottimizzaSpazioDestra = function(nodiSinistra, nodiDestra, profondita) {
		var nodoDestroPiuInBasso = nodiDestra[profondita][nodiDestra[profondita].length - 1];
		var padreDestro = nodoDestroPiuInBasso.getPadre();
		var diffLarghezzaDestro = padreDestro.getPuntoX() + 1.6*padreDestro.getLarghezza() - nodoDestroPiuInBasso.getPuntoX();
		//calcolo la nuova larghezza del livello
		var newPuntoX = nodoDestroPiuInBasso.getPuntoX() + diffLarghezzaDestro; 
		var i = 0;
		var controllatoCriticita = false;
		while(i < nodiSinistra.length && !controllatoCriticita) {
			//un nodo del sottoalbero sinistro puo' sovrapporsi se la propria coordinata y e' inferiore alla coordinata y del nodo destro più l'altezza del nodo e lo spazio
			if(nodiSinistra[i][nodiSinistra[i].length - 1].getPuntoY() < nodoDestroPiuInBasso.getPuntoY() + nodoDestroPiuInBasso.getAltezza() + this._spazioStandard) {
				//calcolo la larghezza del lvello del nodo
				var larghezzaLivelloSinistro = nodiSinistra[i][nodiSinistra[i].length - 1].getPuntoX() + nodiSinistra[i][nodiSinistra[i].length - 1].getLarghezza() + this._spazioStandard*2; //spazio per 2 per distanziare
				if( larghezzaLivelloSinistro > newPuntoX ) {
					newPuntoX = larghezzaLivelloSinistro;
				}
				if(newPuntoX >= nodoDestroPiuInBasso.getPuntoX()) {
					controllatoCriticita = true;
				}
				++i;
			}
			else { //non ci sono altri livelli del sottoalbero destro che si possono sovrapporre
				controllatoCriticita = true;
			}
		}
		if(newPuntoX < nodoDestroPiuInBasso.getPuntoX()) {
			for(var i = 0; i < nodiDestra[profondita].length; ++i) {
				nodiDestra[profondita][i].setX(newPuntoX);
			}
		}
		if(nodiDestra[profondita+1]) {  //il sottoalbero destro e' più profondo
			this.ottimizzaSpazioDestra(nodiSinistra, nodiDestra, profondita+1);
		}
	}	
	
	/*
	Disegna un albero con i nodi più a sinistra incolonnati o più a destra allineati
	nodiPerLivello e' un array che contiene il numero di nodi di ogni livello
	profondita, a che profondita si e' N.B. La radice e' a profondita' -1
	figli, sono i nodi da disegnare, sono dati in formato JSON
	padre e' il padre dei figli ed e' di tipo NodoGrafico
	canvas e' l'oggetto di tipo RaphaelAdapter da passare agli oggetti di tipo nodoGrafico
	offset, e' la coordinata minima x a cui si puo' disegnare un nodo di quel livello. all'ultima iterazione diventa lo spazio occupato in x dal livello
	nodiCreati, array con i riferimenti a tutti i nodi creati. N.B. Non sarebbe indispensabile, ma senza quando si tratta di "correggere" la profondita' dei vari livelli la complessita' algoritmica aumenta troppo.
	tipo: se verticale o orizzontale,
	dimspostamento: la dimensione con cui devo spostare lungo lo stesso livello
	return: lo spazio occupato sull'asse per il disegno da tutti i nodi di quel livello
	*/
	this.creaFigli = function (nodiPerLivello, profondita, figli, padre, canvas, offset, nodiCreati, tipo, dimSpostamento) {

		var coord;
		if(tipo == "verticale") {
			coord = padre.getPuntoY() + padre.getAltezza()*1.6; //altezza standard successivamente verra' sistemata
		}
		else {
			coord = padre.getPuntoX() + padre.getLarghezza()*1.6; //larghezza standard successivamente verra' sistemata
		}
		var noFigliBrother = false; // viene messa a false se il nodo non ha figli, all'iterazione successiva il fratello destro controlla se il fratello sinistro non ha figli.
		var dueopiuFigliFratello = false; //memorizzo se il fratello ha due o più figli, il primo nodo del sottoalbero non puo' spostarsi quindi false
		var spostatoBrother = false; //viene messo a true se il nodo viene spostato, all'iterazione successiva il nodo controllera' se il fratello sinistro e' stato spostato
		for(var i=0; i < figli.length; ++i) {
			
			//creo un array con tutte le proprieta' e rimuovo quelle non-extra, quindi figli e colore
			var arrKeyProp = this.rimuoviNonInformazioni(figli[i]);

			//creo un array con i valori delle proprieta non eliminate
			var arrValueProp = [];
			for(var j = 0; j < arrKeyProp.length; ++j) {
				arrValueProp.push(figli[i][arrKeyProp[j]]);
			}

			if(dueopiuFigliFratello && !(figli[i].figli && figli[i].figli.length > 0)) { //il fratello ha due o più figli e questo nodo non ha figli, posso spostarlo di una grandezza pari alla grandezza del nodo
				offset =  offset - (dimSpostamento + this._spazioStandard);
				spostatoBrother = true;
			} else if(!dueopiuFigliFratello && !(figli[i].figli && figli[i].figli.length > 0)) { //non e' andato nel ramo if non perché il nodo non abbia figli, ma perché il fratello non ha 2 o più figli
				spostatoBrother = false;
			}
			//creo nodo
			nodiCreati[profondita].push(new NodoGrafico());
			//la differenza tra le due chiamate e' che l'offset e' passato come punto x nel primo caso e punto y nel secondo
			if(tipo == "verticale") {
				nodiCreati[profondita][nodiCreati[profondita].length - 1].init(figli[i].nome, figli[i].color, arrValueProp, arrKeyProp, offset, coord, this._lunghezzaNodoStandard, this._altezzaNodoStandard, canvas, padre);
			}
			else {
				nodiCreati[profondita][nodiCreati[profondita].length - 1].init(figli[i].nome, figli[i].color, arrValueProp, arrKeyProp, coord, offset, this._lunghezzaNodoStandard, this._altezzaNodoStandard, canvas, padre);
			}
			
			padre.addFiglio(nodiCreati[profondita][nodiCreati[profondita].length -1]);
			
			//ho disegnato un nodo di questo livello
			--nodiPerLivello[profondita];
			
			if(figli[i].figli && figli[i].figli.length > 0) {
			
				/*ramo if: il fratello non aveva figli, c'e' più spazio per un nodo che ha più di due figli, inoltre il fratello non e' stato spostato e quindi lo spazio c'e' */
				if(figli[i].figli.length > 1 && noFigliBrother == true && spostatoBrother == false) {
					dueopiuFigliFratello = true;
					//chiamate ricorsive, disegno prima i figli del fratello
					if(nodiPerLivello[profondita] == 0) { //se e' l'ultimo nodo del livello non sommo lo spazio occupato dai figli, ma solo del nodo
						this.creaFigli(nodiPerLivello, profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset - (dimSpostamento + this._spazioStandard), nodiCreati, tipo, dimSpostamento);
						offset += dimSpostamento + this._spazioStandard;
					}
					else {
						//lo spazio occupato dal proprio sottoalbero e' >= dello spazio occupato dal nodo
						offset = this.creaFigli(nodiPerLivello, profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset - (dimSpostamento + this._spazioStandard), nodiCreati, tipo, dimSpostamento);
					}
				}
				else {
					//stabilisco solo se ho uno o più figli, ma per l'invocazione ricorsiva i parametri non cambiano.
					if(figli[i].figli.length > 1){ 
						dueopiuFigliFratello = true;
					}
					else {
						dueopiuFigliFratello = false;
					}
					if(nodiPerLivello[profondita] == 0) { //se e' l'ultimo nodo del livello non considero lo spazio occupato dai figli, ma solo del nodo
						this.creaFigli(nodiPerLivello, profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset, nodiCreati, tipo, dimSpostamento);
						offset += dimSpostamento + this._spazioStandard;;
					}
					else {
						//lo spazio occupato dal proprio sottoalbero e' >= dello spazio occupato dal nodo
						offset = this.creaFigli(nodiPerLivello, profondita + 1, figli[i].figli, nodiCreati[profondita][nodiCreati[profondita].length - 1], canvas, offset, nodiCreati, tipo, dimSpostamento);
					}
				}
				noFigliBrother = false; //il nodo in questione ha dei figli
				spostatoBrother = false; //un nodo con figli non puo' essere spostato
			}
			else { //non ci sono figli
				noFigliBrother = true;  //non ha figli
				dueopiuFigliFratello = false; // non ha due figli
				offset += dimSpostamento + this._spazioStandard;
			}
		}
		return offset;
	}
	
	/*
	funzione ricorsiva che restituisce un array dove ogni elemento e' il numero di nodi di profondita' i del sottoalbero N.B. La radice e' a profondita' -1
	nodi sono i figli di un certo nodo.
	*/
	var calcoloNodiPerLivello = function (nodi) {
		var nodiPerLivello = [];
		nodiPerLivello.push(nodi.length); //numero di nodi a profondita' 1
		for(var i = 0; i < nodi.length; ++i) {
			//chiamata ricorsiva
			if(nodi[i].figli != undefined && nodi[i].figli != null) {
				var numbSubTree = calcoloNodiPerLivello(nodi[i].figli);
				for(var j = 0; j < numbSubTree.length; ++j) {
					//se e' il ritorno di una chiamata ricorsiva che restituisce un array di lunghezza + 1 > lunghezza di nodiPerLivello inizializzo
					if(isNaN(nodiPerLivello[1+j])) {
						nodiPerLivello[1+j] = 0;
					}
					//in ogni chiamata l'unico valore da non alterare e' il primo. Per cui cio' che restituisce il figlio va messo dopo. Se ci sono più figli i valori vanno sommati.
					nodiPerLivello[1+j] += numbSubTree[j];
				}
			}
		}
		return nodiPerLivello;
	}

	/*primo step  qui creo la radice e divido a meta' l'albero. e chiamo le due funzioni che disegnano la parte sinistra e poi la parte destra
	Json, contiene i dati
	canvas, l'oggetto di tipo RaphaelAdapter da passare alle istanze di NodoGrafico
	*/
	this.creaRadice = function(Json, canvas, lunghezza, altezza, spazioTraNodi) {
		if(!Json) { //json vuoto
			return;
		}
		
		var arrKeyProp = this.rimuoviNonInformazioni(Json);
		//creo un array con i valori delle proprieta non eliminate
		var arrValueProp = [];
		for(var i = 0; i < arrKeyProp.length; ++i) {
			arrValueProp.push(Json[arrKeyProp[i]]);
		}
		
		this._padre = new NodoGrafico();
		this._padre.init(Json.nome, Json.color, arrValueProp, arrKeyProp, 10, 10, lunghezza, altezza, canvas, null);
		
		if(!Json.figli) { //non ci sono figli
			return;
		}
		this._lunghezzaNodoStandard = lunghezza;
		this._altezzaNodoStandard = altezza;
		this._spazioStandard = spazioTraNodi;
		//numero di nodi che disegno a sinistra
		var metaSinistra = Math.ceil(Json.figli.length / 2); //arrotondo sempre all'intero superiore, si puo' utilizzare anche round, ma così e' esplicito

		var nodiJsonMeta = [];
		for(var i = 0; i < metaSinistra; ++i ) {
			nodiJsonMeta.push(Json.figli[i]);
		}
		var nodePerLevel = calcoloNodiPerLivello(nodiJsonMeta);
		
		//allNodeLeft conterra' tutti i nodi grafici creati a sinistra, array bidemnsionale, il primo indice corrisponde alla profondita' meno uno dei nodi, ad es un nodo di profondita' uno sara' sull'indice zero
		var allNodeLeft = [];
		for(var i = 0; i < nodePerLevel.length; ++i) {
			allNodeLeft.push(new Array());
		}
		this.creaFigli(nodePerLevel, 0, nodiJsonMeta, this._padre, canvas, this._padre.getPuntoX(), allNodeLeft, "verticale", this._lunghezzaNodoStandard);
		
		if(Json.figli.length > 1) { //non ho nodi a destra
			//tutta la parte sinistra e' creata, si passa a quella destra
			nodiJsonMeta = [];
			for(var i = metaSinistra; i < Json.figli.length; ++i ) {
				nodiJsonMeta.push(Json.figli[i]);
			}
			nodePerLevel = [];
			nodePerLevel = calcoloNodiPerLivello(nodiJsonMeta);
			
			//allNode conterra' tutti i nodi grafici creati, array bidemnsionale, il primo indice corrisponde alla profondita' meno uno dei nodi, ad es un nodo di profondita' uno sara' sull'indice zero
			var allNodeRight = [];
			for(var i = 0; i < nodePerLevel.length; ++i) {
				allNodeRight.push(new Array());
			}
			this.creaFigli(nodePerLevel, 0, nodiJsonMeta, this._padre, canvas, this._padre.getPuntoY(), allNodeRight, "orizzontale", this._altezzaNodoStandard);
			
			//angolo necessario per separare correttamente in due il canvas. e' l'arccoseno della lunghezza di un nodo diviso dall'ipotenusa dell'ipotetico triangolo dove la lunghezza e' il cateto maggiore
			var angleIpotenusaBase = Math.acos(this._lunghezzaNodoStandard/Math.sqrt(this._lunghezzaNodoStandard*this._lunghezzaNodoStandard + this._altezzaNodoStandard*this._altezzaNodoStandard)); 
			
			//sistemo l'altezza dei vari livelli solo se entrambi i rami dell'albero sono stati creati
			this.sistemaLivelli(allNodeLeft, allNodeRight, angleIpotenusaBase, 0);
			this.ottimizzaSpazio(allNodeLeft, allNodeRight, 0);
		}
		//sistemo la dimensione del canvas se non supporta SVG
		if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
			canvas.resizeCanvas(this._padre.getLarghezzaSubTree() + 5 ,this._padre.getAltezzaSubTree() + 5);
		}
	}
}
