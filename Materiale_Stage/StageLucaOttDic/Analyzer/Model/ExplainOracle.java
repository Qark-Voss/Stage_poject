package com.zucchetti.sitepainter.Analyzer.Model;

import com.zucchetti.SPBridge.*;

public class ExplainOracle implements ExplainInterface {
	
	private Nodo lista;//viene memorizzato temporaneamente l'albero
	private double totalCost;//valore 
	
	private String query_plan = "SELECT LEVEL, OPERATION, OPTIONS, CPU_COST, OBJECT_NAME, CARDINALITY, FILTER_PREDICATES, ACCESS_PREDICATES FROM PLAN_TABLE START WITH ID=0 CONNECT BY PRIOR ID = PARENT_ID ORDER BY ID";
	
	public Nodo explainQuery(String query, String contextID) {
		if(query.equals("") || contextID.equals(""))
			return null;
		Sitepainter sp = new Sitepainter();
		sp.setContext(contextID);
		sp.requireTransaction();
		sp.queryDirect("DELETE FROM plan_table");
		sp.queryDirect("EXPLAIN PLAN FOR " + query);
		SPJSPBridge.CPResultSet cprs = sp.queryDirect(query_plan);
		sp.completeTransaction();
		lista = null;
		totalCost = 0;
		if(!cprs.Eof())
			inserisciNodo(cprs);
		cprs.Close();
		return lista;
	}
	
	private void inserisciNodo(SPJSPBridge.CPResultSet rs) {//l'albero viene creato al ritorno
		if(rs == null)
			return;
		Nodo n = new Nodo();
		int livello = rs.GetInt(rs.GetColumnName(1));//trovo il livello del nodo
		if(livello != 1) {
			String nome = rs.GetColumnString(2);//trovo il nome del nodo
			if(!rs.GetColumnString(3).equals(null))//controllo se presente un'opzione dell'operazione e in caso l'aggiungo al nome
				nome = nome + " " + rs.GetColumnString(3);
			if(nome.endsWith(" "))//elimina gli spazi in eccesso alla fine del nome
				nome = nome.substring(0, nome.length()-1);
			n.setNome(nome);//inserisco il nome dell'operazione
			n.setCost(rs.GetInt(rs.GetColumnName(4)));//inserisco il costo dell'operazione
			if(nome.equals("BITMAP") || nome.equals("TABLE ACCESS") || nome.equals("INDEX"))//se l'operazione usa una tabella ricavo il nome
				n.setTable(rs.GetColumnString(5));//inserisco il nome della tabella
			n.setRow(rs.GetInt(rs.GetColumnName(6)));//inserisco il numero di righe restituite dell'operazione
			String filtro = rs.GetColumnString(7);
			if (!filtro.equals("")) {
				filtro += " ";
			}
			filtro += rs.GetColumnString(8); //i filtri possono essere su due colonne
			n.setPredicate(filtro);//inserisco il filtro
			if(livello == 2) {//nodo padre
				lista = n;
			}
			else{//nodo figlio
				Nodo padre = lista;
				for(int i = 3; i < livello; ++i)//scendo lungo l'albero finché non raggiungo il padre, i uguale a 3 perché è dal 3 livello in poi che devo scendere lungo l'albero
					padre = (Nodo) padre.getFigli().lastElement();
				padre.addFiglio(n);//aggiungo il figlio alla lista dei figli del padre
			}
		}
		rs.Next();//passo al prossimo nodo
		if(!rs.Eof()) {//passa al prossimo nodo da inserire
			inserisciNodo(rs);
		}
		else{//inizia a sistemare i costi delle operazioni
			setPadri(lista);
			riempiBuchi(lista);//assegna i costi delle operazioni ai nodi che ne sono sprovvisti
			totalCost = lista.getCost();//recupera il costo totale dell'intera query
			normalizeCosts(lista);//inizia a calcolare i costi delle singole operazioni
		}
		return;
	}
	
	private void setPadri(InterfaceNodo n){
		if(n == null)
			return;
		for(int i = 0; i<n.getFigli().size(); ++i){
			((Nodo) n.getFiglio(i)).setPadre((Nodo) n);
			setPadri(n.getFiglio(i));
		}
	}
	
	private void riempiBuchi(InterfaceNodo n) {
		if(n == null || n.getFigli().isEmpty())
			return;
		for(int i = 0; i<n.getFigli().size(); ++i)
			riempiBuchi(n.getFiglio(i));
		for(int i = 0; i<n.getFigli().size(); ++i)
			((Nodo) n).setCost(n.getCost() + n.getFiglio(i).getCost());
	}
	
	private void normalizeCosts(InterfaceNodo n) {
		if(n.getFigli().isEmpty()){
			((Nodo) n).setPerc((int)(Math.rint((n.getCost() * 100) / totalCost)));
			return;
		}
		for(int i = 0; i<n.getFigli().size(); ++i){
			((Nodo) n).setCost(n.getCost() - n.getFiglio(i).getCost());
			normalizeCosts(n.getFiglio(i));
		}
		((Nodo) n).setPerc((int)(Math.rint((n.getCost() * 100) / totalCost)));
	}

}
