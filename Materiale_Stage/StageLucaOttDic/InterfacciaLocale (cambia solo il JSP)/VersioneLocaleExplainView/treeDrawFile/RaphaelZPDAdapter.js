var ZPDInterface = new Interface('ZPDInterface', ['init']);

/*
Interfaccia per ottenere oggetti della libreria RaphaelZPD, la funzione controlla se i parametri siano corretti, se non lo sono fa comparire un avviso e ritorna null
*/
//creo un oggetto di tipo ZPDAdapter
function RaphaelZPDAdapter() {
  
	this.init=function(paper, isZoom, isPan, isDrag){
		if(paper instanceof Raphael && typeof isZoom == "boolean" && typeof isPan == "boolean" && typeof isDrag == "boolean") {
			//inizializzo lo zpd
			try { 
				var zpd = new RaphaelZPD(paper, { zoom: isZoom, pan: isPan, drag: isDrag });
				
				var noZoomBrowser = function (e) { 
                    if ((e.which == 187 || e.which == 107) && e.ctrlKey === true) { // + sia tastiera che tastierino numerico
						if (e.preventDefault) {
                            e.preventDefault();
                        }
                        e.returnValue = false;
						var stub = {target : {ownerDocument : document},
							clientX : document.width / 2,
							clientY : document.height / 2,
							detail : -5 };
						zpd.handleMouseWheel(stub);
                    }
                    else if ((e.which == 189 || e.which == 109) && e.ctrlKey === true) { //  - sia tastiera che tastierino numerico
                        if (e.preventDefault) {
                               e.preventDefault();
                        }
                        e.returnValue = false;
						var stub = {target : {ownerDocument : document},
							clientX : document.width / 2,
							clientY : document.height / 2,
							detail : 5};
						zpd.handleMouseWheel(stub);
                    }
                }
				if (navigator.userAgent.toLowerCase().indexOf("webkit") >= 0) { // solo per chrome e safari si può cambiare comportamento zoom
					window.document.addEventListener("keydown", noZoomBrowser);
				}
			}
			catch (err) {
				alert("funzionalit\340 zoom non disponibile utilizzare un browser pi\371 recente");
			}
		}
		else {
			alert("Parametri errati per ZPD");
			return null;
		}
	}  
};