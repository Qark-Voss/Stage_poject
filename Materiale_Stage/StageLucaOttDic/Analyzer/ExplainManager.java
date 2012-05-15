package com.zucchetti.sitepainter.Analyzer;

import com.zucchetti.SPBridge.*;

import com.zucchetti.sitepainter.Analyzer.Model.InterfaceNodo;
import com.zucchetti.sitepainter.Analyzer.Controller.ControllerFacade;

public class ExplainManager {
	private static ControllerFacade controller;
	
	public static String getExplainPlan(int DB, String query, String contextID) {
		return getExplainPlan(DB,query,contextID,1);
	}
	
	public static String getExplainPlan(int DB, String query, String contextID, int type) {
		if(controller == null)
			controller = ControllerFacade.getController();
		
		controller.explainQuery(DB, query, contextID);//esegue l'explain della query
		//test(contextID, DB);//avvia la test suite
		//controller.saveXML(contextID);//salva il documento in xml
		
		String toReturn = "";
		switch(type) {
			case 1 : 
				toReturn = controller.toJsonString(contextID);//ritorna il json del piano di esecuzione
				break;
			case 2 : 
				toReturn = controller.toXMLString(contextID);//ritorna l'xml del piano di esecuzione
				break;
			case 3 :
				toReturn = controller.toText(contextID);//ritorna il piano di esecuzione in forma testuale
				break;
		}
		return toReturn;
	}
	
	/*
	public static void test(String contextID, int DB) {
		ControllerTestSuite controller = new ControllerTestSuite();
		if(controller.tests())
			System.out.println("controller pass");
		else
			System.out.println("controller not pass");
		ModelTestSuite model = new ModelTestSuite();
		if(model.tests(contextID, DB))
			System.out.println("model pass");
		else
			System.out.println("model not pass");
	}
	*/
}

//jdbc\:sqlserver\://Server2003;;databaseName=marcored_sixsigma sa zucchetti
//jdbc:postgresql://192.168.3.200:5434/marcored_sixsigma postgres zucchetti
//jdbc:oracle:thin:@//192.168.3.160:1521/ORCL SIXSIGMA zucchetti