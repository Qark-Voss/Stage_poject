package com.zucchetti.sitepainter.Analyzer.Controller;

import org.json.JSONObject;
import org.json.JSONArray;

import com.zucchetti.sitepainter.Analyzer.Model.InterfaceNodo;
import com.zucchetti.sitepainter.Analyzer.Model.ModelFacade;

public class JsonConverter {
	private static JsonConverter json;
	
	private ModelFacade model;
	private EvalFactoryInterface factory;
	private EvaluationAbstract eval;
	
	private JsonConverter() {}
	
	public static JsonConverter getJsonConverter() {
		if(json == null)
			json = new JsonConverter();
		return json;
	}

	public String toJson(String contextID) {
		initializes();
		InterfaceNodo tree = getTree();
		if(tree == null)
			return "";
		eval = factory.getEvaluation(model.getDB());
		String jsonString = "";
		JSONObject json = generateJson(tree, contextID);
		if(json == null)
			return "";
		try{
			jsonString = json.toString(2);//trasforma JSONObject in string con indentazione di 2 spazi per ogni livello
		}catch(Exception e){
			e.printStackTrace();
		}
		return jsonString;
	}
	
	private void initializes() {
		if(model == null)
			model = ModelFacade.getModel();
		if(factory == null)
			factory = EvaluationFactory.getEvaluationFactory();
	}
	
	private InterfaceNodo getTree() {
		return model.getQueryTree();
	}
	
	private JSONObject generateJson(InterfaceNodo n, String contextID) {
		if(n == null)
			return new JSONObject();
		JSONObject json = new JSONObject();
		try{
			json.put("nome", n.getNome());
			json.put("time", n.getPerc() + "%");
			json.put("row", n.getRow());
			if(!n.getTable().equals("")) {
				json.put("table", n.getTable());
				json.put("color", eval.eval(n.getNome(), n.getTable(), contextID));
			}
			else {
				json.put("color", eval.eval(n.getNome()));
			}
			if(!n.getPredicate().equals(""))
				json.put("filter", n.getPredicate());
			if(!n.getFigli().isEmpty()) {
				JSONArray array = new  JSONArray();
				for(int i = 0; i<n.getFigli().size(); i = i + 1)
					array.put(generateJson(n.getFiglio(i), contextID));
				json.put("figli", array);
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		return json;
	}
	
}
