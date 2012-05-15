package com.zucchetti.sitepainter.Analyzer.Model;

public class ExplainFactory implements ExplFactoryInterface {//singleton class
	private static ExplainFactory factory;
	
	private ExplainFactory(){}
	
	public static ExplFactoryInterface getExplainFactory(){
		if(factory == null)
			factory = new ExplainFactory();
		return factory;
	}
	public ExplainInterface getExplainer(int DB){
		switch (DB) {
		case 1 : //sql server
			return new ExplainSQLServer();
		case 2 : //oracle
			return new ExplainOracle();
		case 10 : //postgres
			return new ExplainPostgres();
		default :
			return null;
		}
	}
}
