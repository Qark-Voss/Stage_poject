package com.zucchetti.sitepainter.Analyzer.Controller;

import com.zucchetti.sitepainter.Analyzer.Model.InterfaceNodo;
import com.zucchetti.sitepainter.Analyzer.Model.ModelFacade;

public class TextConverter {
	private static TextConverter text;
	
	private ModelFacade model;
	private EvalFactoryInterface factory;
	private EvaluationAbstract eval;
	
	private TextConverter(){}
	
	public static TextConverter getTextConverter(){
		if(text == null)
			text = new TextConverter();
		return text;
	}
	
	public String toText(String contextID) {
		initializes();
		InterfaceNodo tree = model.getQueryTree();
		if(tree == null)
			return "";
			
		// restituisce la classe Evaluation richiesta per assegnare il giudizio (colore) in base al DB interrogato
		eval = factory.getEvaluation(model.getDB());
		if(eval == null)
			return "";
		String risultato = stampaAlbero(tree, "", contextID);
		return risultato;
	}
	
	//inizializza le variabili model e factory se sono a null, model contiene 
	private void initializes() {
		if(model == null)
			model = ModelFacade.getModel();
		if(factory == null)
			factory = EvaluationFactory.getEvaluationFactory();
	}
	
	private String stampaAlbero(InterfaceNodo n, String risultato, String contextID) {
		if(n == null)
			return "";
		String tab = spazi(n);
		String nome = n.getNome();
		risultato = risultato + tab + n.getNome() + ", time: " + n.getPerc() + "%, estimate rows: " + n.getRow();
		if(!n.getTable().equals("")) {
			risultato = risultato + ", table: " + n.getTable();
			//user è uno stub 
			risultato = risultato + "color:" + eval.eval(nome, n.getTable(), contextID) + "\n";
		}
		else {
			risultato = risultato + "color:" + eval.eval(nome) + "\n";
		}
		if(!n.getPredicate().equals(""))
			risultato = risultato + ", predicate: " + n.getPredicate();
		
		
		if(n.getFigli().size()!=0){
			int i=0;
			while(i<n.getFigli().size()){
				risultato = stampaAlbero(n.getFiglio(i), risultato, contextID);
				i =  i + 1;
			}
		}
		return risultato;
	}
	
	private String spazi(InterfaceNodo n){
		if(n == null)
			return "";
		String tab = "";
		if(n.getPadre() != null){
			tab = " |";
			n = n.getPadre();
		}
		while(n.getPadre() != null){
			if(n != n.getPadre().getFigli().lastElement())
				tab = " |" + tab;
			else
				tab = "  " + tab;
			n = n.getPadre();
		}
		return tab;
	}
}
