package com.zucchetti.sitepainter.Analyzer.Controller;

import com.zucchetti.SPBridge.Sitepainter;

public class EvaluationSQLServer extends EvaluationAbstract {
	
	//inizializzo gli array con le operazioni. Riga vuota tra i vari tipi di operazione
	static {
		addOperation(operationType.altoRischio, "Index Scan");
		addOperation(operationType.altoRischio, "Clustered Index Scan");
		addOperation(operationType.altoRischio, "Nonclustered Index Scan");
		addOperation(operationType.altoRischio, "Parameter Table Scan");
		addOperation(operationType.altoRischio, "Table Scan");
		
		addOperation(operationType.medioRischio, "Sort");
		addOperation(operationType.medioRischio, "Hash Match");
		addOperation(operationType.medioRischio, "Hash Match Root"); // da rimuovere, basta Hash Match
		addOperation(operationType.medioRischio, "Hash Match Team"); // da rimuovere, basta Hash Match
		addOperation(operationType.medioRischio, "Table Spool");
		
		addOperation(operationType.bassoRischio, "Index Seek");
		addOperation(operationType.bassoRischio, "Clustered Index Seek");
		addOperation(operationType.bassoRischio, "Merge Join");
		addOperation(operationType.bassoRischio, "Nested Loops");
		addOperation(operationType.bassoRischio, "Compute Scalar");
		addOperation(operationType.bassoRischio, "Concatenation");
		addOperation(operationType.bassoRischio, "Constant Scan"); 
		
		addOperation(operationType.aggregazione, "Filter");
		addOperation(operationType.aggregazione, "Stream Aggregate");
	}
	
	protected boolean tableIsLittle(String name, String nomeTabella, String contextID) {
		boolean tabellaPiccola = false;
		if(nomeTabella.equals("") || contextID.equals("") || !name.equals("Table Scan")) {
			//non faccio nulla
		}
		else {
			Sitepainter sp = new Sitepainter();
			int righePianificate = sp.GetTableExpMaxRows(nomeTabella);
			if(righePianificate < numRighe && righePianificate > 0) {
				tabellaPiccola = true;
			}
		}
		return tabellaPiccola;
	}
	
	
}