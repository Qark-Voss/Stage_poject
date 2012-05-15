package com.zucchetti.sitepainter.Analyzer.Model;

public class ModelFacade {
	private QueryPlan plan;
	
	private ExplFactoryInterface factory;
	private ExplainInterface explainer;
	
	private static ModelFacade model;
	private ModelFacade() {}
	
	public static ModelFacade getModel() {
		if(model == null)
			model = new ModelFacade();
		return model;
	}
	
	public int getDB() {
		return plan.getDB();
	}
	
	public String getQuery() {
		return plan.getQuery();
	}
	
	public InterfaceNodo getQueryTree() {
		return plan.getTree();
	}
	
	public void explainQuery(int db, String q, String contextID) {
		//se l'ultima query con cui si è fatto l'explain è uguale a quella precedente non faccio nulla
		if(plan != null && plan.getDB() == db && q.equals(plan.getQuery()))
			return;
		if(factory == null)
			factory = ExplainFactory.getExplainFactory();
		explainer = factory.getExplainer(db);
		if(explainer == null)
			return;
		if(plan == null)
			plan = new QueryPlan();
		plan.queryExplained(db, q, explainer.explainQuery(q, contextID));
	}
	
}
