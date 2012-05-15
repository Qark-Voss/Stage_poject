package com.zucchetti.sitepainter.Analyzer.Controller;

import com.zucchetti.sitepainter.Library;
import java.util.ArrayList;

/*classe astratta.

*/
public abstract class EvaluationAbstract {

	// array per contenere le operazioni
	private static ArrayList<String> highRiskOperation = new ArrayList<String>();
	private static ArrayList<String> mediumRiskOperation = new ArrayList<String>();
	private static ArrayList<String> lowRiskOperation = new ArrayList<String>();
	private static ArrayList<String> aggregateOperation = new ArrayList<String>();
	
	//restituisco l'array 
	private static ArrayList<String> getArray(operationType tipo) {
		ArrayList<String> valToReturn = new ArrayList<String>();
		switch (tipo) {
			case altoRischio:
				valToReturn = highRiskOperation;
				break;
			case medioRischio: 
				valToReturn = mediumRiskOperation;
				break;
			case bassoRischio:
				valToReturn = lowRiskOperation;
				break;
			case aggregazione:
				valToReturn = aggregateOperation;
				break;
		}
		return valToReturn;
	}
	
	/*ritorna true, se l'elemento è nell'array del tipo selezionato. 
	 Utilizzando startsWith bisogna assicurarsi che nelle varie classi dove si inizializzano gli array non ci siano operazioni con lo stesso prefisso */
	private boolean isThatType(String valore, operationType tipo) {
		ArrayList<String> operations = getArray(tipo);
		boolean trovato = false;
		for(int i = 0; i < operations.size() && !trovato; ++i) {
			if(valore.startsWith(operations.get(i))) {
				trovato = true;
			}
		}
		return trovato;
	}
	
	//stringhe per i colori
	private static String altoCarico;
	private static String altoCaricoEntroPianificazione;
	private static String medioCarico;
	private static String bassoCarico;
	private static String aggregazione;
	private static String nonRiconosciute;
	
	static {
		altoCarico = "red";
		altoCaricoEntroPianificazione = "pink";
		medioCarico = "yellow";
		bassoCarico = "green";
		aggregazione = "blue";
		nonRiconosciute = "black";
		Library.initFromConfig(EvaluationAbstract.class, "com.zucchetti.sitepainter.Analyzer.Controller.EvaluationAbstract");
	}
	
	//tipo enum per delineare le quattro tipologie possibili di nodi
	protected enum operationType {
		altoRischio, medioRischio, bassoRischio, aggregazione
	}
	
	/* per aggiungere agli array i loro membri. Tipo è la categoria dell'operazione, valore il valore.
	tipo è di tipo operationType, un enum per limitare le possibili scelte
	*/
	protected static void addOperation(operationType tipo, String valore) {
		switch (tipo) {
			case altoRischio:
				highRiskOperation.add(valore);
				break;
			case medioRischio: 
				mediumRiskOperation.add(valore);
				break;
			case bassoRischio:
				lowRiskOperation.add(valore);
				break;
			case aggregazione:
				aggregateOperation.add(valore);
				break;
		}
	}
	
	//valore righe per cui una tabella è piccola
	protected static int numRighe = 100;

	/*il metodo restituisce una stringa, che rappresenta un colore in base all'operazione. 
	Se l'operazione è pericolosa invoca tableIsLittle, se ritorna true allora viene restituito un colore diverso da quello di default
	*/
	public String eval(String name, String nomeTabella, String contextID){
		if(isThatType(name, operationType.altoRischio)) {
			if(this.tableIsLittle(name, nomeTabella, contextID)) {
				return altoCaricoEntroPianificazione;
			}
			else {
				return altoCarico;
			}
		}
		if(isThatType(name, operationType.medioRischio))
			return medioCarico;
		if(isThatType(name, operationType.bassoRischio))
			return bassoCarico;
		if(isThatType(name, operationType.aggregazione))
			return aggregazione;
		return nonRiconosciute;
	}
	
	public String eval(String name){
		return eval(name, "", "");
	}
	
	/*
	Questo metodo stabilisce se una certa tabella del DB è piccola 
	true, se è così.
	false, altrimenti
	Unico metodo da implementare
	*/
	protected abstract boolean tableIsLittle(String name, String nomeTabella, String contextID); 
}