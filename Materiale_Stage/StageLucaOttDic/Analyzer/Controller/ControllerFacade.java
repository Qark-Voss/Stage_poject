package com.zucchetti.sitepainter.Analyzer.Controller;

import com.zucchetti.sitepainter.Analyzer.Model.ModelFacade;

public class ControllerFacade {
	private static ControllerFacade controller;
	
	private JsonConverter json;
	private TextConverter text;
	private XMLConverter xml;
	
	private ModelFacade model;
	
	private ControllerFacade(){}
	
	public static ControllerFacade getController(){
		if(controller == null)
			controller = new ControllerFacade();
		return controller;
	}
	
	public int getDB() {
		if(model == null)
			model = ModelFacade.getModel();
		return model.getDB();
	}
	
	public String getQuery() {
		if(model == null)
			model = ModelFacade.getModel();
		return model.getQuery();
	}
	
	public void explainQuery(int DB, String query, String contextID){
		if(model == null)
			model = ModelFacade.getModel();
		model.explainQuery(DB, query, contextID);
	}

	public String toText(String contextID){
		if(text == null)
			text = TextConverter.getTextConverter();
		return text.toText(contextID);
	}
	
	public String toXMLString(String contextID){
		if(xml == null)
			xml = XMLConverter.getXmlConverter();
		return xml.toXMLString(contextID);
	}
	
	public void saveXML(String contextID){
		if(xml == null)
			xml = XMLConverter.getXmlConverter();
		xml.saveXMLFile(contextID);
		return;
	}
	
	public String toJsonString(String contextID){
		if(json == null)
			json = JsonConverter.getJsonConverter();
		return json.toJson(contextID);
	}
}
