package com.zucchetti.sitepainter.Analyzer.Controller;

import com.zucchetti.SPBridge.Sitepainter;

public class EvaluationOracle extends EvaluationAbstract {
	//controllare!
	static {
		addOperation(operationType.altoRischio, "INDEX FAST FULL SCAN");
		addOperation(operationType.altoRischio, "INDEX FULL SCAN");
		addOperation(operationType.altoRischio, "TABLE ACCESS FULL");
		
		addOperation(operationType.medioRischio, "BUFFER SORT");
		addOperation(operationType.medioRischio, "HASH JOIN");
		addOperation(operationType.medioRischio, "SORT");
		addOperation(operationType.medioRischio, "VIEW");
		
		addOperation(operationType.bassoRischio, "BITMAP");
		addOperation(operationType.bassoRischio, "CONCATENATION");
		addOperation(operationType.bassoRischio, "INDEX SKIP SCAN");
		addOperation(operationType.bassoRischio, "INDEX UNIQUE SCAN");
		addOperation(operationType.bassoRischio, "INDEX RANGE SCAN");
		addOperation(operationType.bassoRischio, "MERGE JOIN");
		addOperation(operationType.bassoRischio, "NESTED LOOPS");
		addOperation(operationType.bassoRischio, "SELECT STATEMENT");
		addOperation(operationType.bassoRischio, "TABLE ACCESS BY INDEX ROWID");
		addOperation(operationType.bassoRischio, "UNION-ALL");
		
		addOperation(operationType.aggregazione, "FILTER");
	}
	
	protected boolean tableIsLittle(String name, String nomeTabella, String contextID) {
		boolean tabellaPiccola = false;
		if(nomeTabella.equals("") || contextID.equals("") || !name.startsWith("TABLE ACCESS")) {
			//non faccio nulla
		}
		else {
			Sitepainter sp = new Sitepainter();
			sp.setContext(contextID);
			int righePianificate = sp.GetTableExpMaxRows(nomeTabella);
			if(righePianificate < numRighe && righePianificate > 0) {
				tabellaPiccola = true;
			}
		}
		return tabellaPiccola;
	}
}