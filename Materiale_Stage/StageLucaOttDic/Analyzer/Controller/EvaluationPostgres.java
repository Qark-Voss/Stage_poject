package com.zucchetti.sitepainter.Analyzer.Controller;

import com.zucchetti.SPBridge.Sitepainter;

public class EvaluationPostgres extends EvaluationAbstract {
	// da capire che tipo è SubQuery Scan
	static {
		
		addOperation(operationType.altoRischio, "Seq Scan");
		
		addOperation(operationType.medioRischio, "Sort");
		addOperation(operationType.medioRischio, "Hash");
		addOperation(operationType.medioRischio, "Hash Join"); //basta hash
		addOperation(operationType.medioRischio, "Materialize");
		
		addOperation(operationType.bassoRischio, "BitmapOr");
		addOperation(operationType.bassoRischio, "BitmapAnd");
		addOperation(operationType.bassoRischio, "Bitmap Heap Scan");
		addOperation(operationType.bassoRischio, "Bitmap Index Scan");
		addOperation(operationType.bassoRischio, "Index Scan");
		addOperation(operationType.bassoRischio, "Merge Append");
		addOperation(operationType.bassoRischio, "Merge Join"); //fare solo merge, se tutti i merge sono verdi
		addOperation(operationType.bassoRischio, "Nested Loop");
		addOperation(operationType.bassoRischio, "Append");
		addOperation(operationType.bassoRischio, "Result");
		
		addOperation(operationType.aggregazione, "Aggregate");
		addOperation(operationType.aggregazione, "Unique");
	}
	
	protected boolean tableIsLittle(String name, String nomeTabella, String contextID) {
		boolean tabellaPiccola = false;
		if(nomeTabella.equals("") || contextID.equals("") || !name.equals("Seq Scan")) {
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