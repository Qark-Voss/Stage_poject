package com.zucchetti.sitepainter.Analyzer.Controller;

public class EvaluationFactory implements EvalFactoryInterface {//singleton class
	private static EvaluationFactory factory;
	
	private EvaluationFactory(){}
	
	public static EvalFactoryInterface getEvaluationFactory(){
		if(factory == null)
			factory = new EvaluationFactory();
		return factory;
	}
	public EvaluationAbstract getEvaluation(int DB){
		switch (DB) {
		case 1 : //sql server
			return new EvaluationSQLServer();
		case 2 : //oracle
			return new EvaluationOracle();
		case 10 : //postgres
			return new EvaluationPostgres();
		default :
			return null;
		}
	}
}
