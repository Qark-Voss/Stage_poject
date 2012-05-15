package com.zucchetti.sitepainter.Analyzer.Controller;

import java.io.File;
import java.io.FileOutputStream;
import java.io.StringWriter;
import java.util.Calendar;
import java.util.GregorianCalendar;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.zucchetti.sitepainter.Analyzer.Model.InterfaceNodo;
import com.zucchetti.sitepainter.Analyzer.Model.ModelFacade;
import com.zucchetti.sitepainter.Library;

public class XMLConverter {
	private static XMLConverter xml;
	
	private ModelFacade model;
	private EvalFactoryInterface factory;
	private EvaluationAbstract eval;
	
	private XMLConverter(){}
	
	public static XMLConverter getXmlConverter(){
		if(xml == null)
			xml = new XMLConverter();
		return xml;
	}
	
	public String toXMLString(String contextID) {
		initializes();
		InterfaceNodo tree = getTree();
		if(tree == null)
			return "";
		eval = factory.getEvaluation(model.getDB());
		Document doc = createDOM(tree, contextID);
		if(doc == null)
			return "";
		String xmlString = "";
		try{
			Transformer transformer = TransformerFactory.newInstance().newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
		
			//initialize StreamResult with File object to save to file
			StreamResult result = new StreamResult(new StringWriter());
			DOMSource source = new DOMSource(doc);
			transformer.transform(source, result);
			
			xmlString = result.getWriter().toString();
		}catch(Exception ec){
			ec.printStackTrace();
		}
		return xmlString;
	}
	
	public void saveXMLFile(String contextID){
		initializes();
		InterfaceNodo tree = getTree();
		if(tree == null)
			return;
		eval = factory.getEvaluation(model.getDB());
		Document dom = createDOM(tree, contextID);
		if(dom == null)
			return;
		String date = getTime();
		try
		{
			String path = Library.GetClassesPath();
			File tmp = new File(path + File.separator + "analyzer");
				if (!(tmp.exists()))
					tmp.mkdir();
			Transformer tr = TransformerFactory.newInstance().newTransformer();
			tr.setOutputProperty(OutputKeys.INDENT, "yes");
			tr.setOutputProperty(OutputKeys.METHOD, "xml");
			tr.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "3");

			tr.transform(new DOMSource(dom), new StreamResult(new FileOutputStream(path + File.separator + "analyzer" + File.separator + "query_plan." + date + ".xml")));

		} catch(Exception e) {
		    e.printStackTrace();
		}
	}
	
	private void initializes() {
		if(model == null)
			model = ModelFacade.getModel();
		if(factory == null)
			factory = EvaluationFactory.getEvaluationFactory();
	}
	
	private InterfaceNodo getTree(){
		if(model == null)
			model = ModelFacade.getModel();
		return model.getQueryTree();
	}
	
	private Document createDOM(InterfaceNodo n, String contextID){
		if(n == null)
			return null;
		Document doc = null;
		try{
			DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
			doc = documentBuilder.newDocument();
		}catch(Exception e){
			e.printStackTrace();
		}
		if(doc == null)
			return null;
		Element e = doc.createElement("PLAN");
		switch (model.getDB()) {
		case 1 : //sql server
			e.setAttribute("database", "Microsoft SQL Server");
		case 2 : //oracle
			e.setAttribute("database", "Oracle");
		case 10 : //postgres
			e.setAttribute("database", "PostgreSQL");
		}
		doc.appendChild(e);
		generateDocument(doc, doc.getFirstChild(), n, contextID);
		return doc;
	}
	
	private void generateDocument(Document doc, Node padre, InterfaceNodo n, String contextID) {
		Node op = doc.createElement("NODO");
		padre.appendChild(op);
		
		Node name = doc.createElement("NAME");
		name.setTextContent(n.getNome());
		op.appendChild(name);
		Node perc = doc.createElement("PERC");
		perc.setTextContent(Double.toString(n.getPerc()));
		op.appendChild(perc);
		Node row = doc.createElement("ROW");
		row.setTextContent(Double.toString(n.getRow()));
		op.appendChild(row);
		if(!n.getPredicate().equals("")){
			Node filter = doc.createElement("FILTER");
			filter.setTextContent(n.getPredicate());
			op.appendChild(filter);
		}
		if(!n.getTable().equals("")){
			Node table = doc.createElement("TABLE");
			table.setTextContent(n.getTable());
			op.appendChild(table);
		}
		Node color = doc.createElement("COLOR");
		if(!n.getTable().equals("")){
			color.setTextContent(eval.eval(n.getNome(), n.getTable(), contextID));
		}
		else {
			color.setTextContent(eval.eval(n.getNome()));
		}
		op.appendChild(color);
		if(!n.getTable().equals("")){
			Node table = doc.createElement("TABLE");
			table.setTextContent(n.getTable());
			op.appendChild(table);
		}
		
		if(!n.getFigli().isEmpty()){
			for(int i = 0; i<n.getFigli().size(); i = i + 1)
				generateDocument(doc, op, n.getFiglio(i), contextID);
		}
	}
	
	private String getTime() {
		Calendar calendar = new GregorianCalendar();
		String date = calendar.get(Calendar.YEAR) + ".";
		String temp = calendar.get(Calendar.MONTH) + ".";
		if(temp.length() == 2)
			temp = "0" + temp;
		date = date + temp;
		temp = calendar.get(Calendar.DAY_OF_MONTH) + ".";
		if(temp.length() == 2)
			temp = "0" + temp;
		date = date + temp;
		temp = calendar.get(Calendar.HOUR_OF_DAY) + ".";
		if(temp.length() == 2)
			temp = "0" + temp;
		date = date + temp;
		temp = calendar.get(Calendar.MINUTE) + ".";
		if(temp.length() == 2)
			temp = "0" + temp;
		date = date + temp;
		temp = calendar.get(Calendar.SECOND) + ".";
		if(temp.length() == 2)
			temp = "0" + temp;
		date = date + temp;
		temp = calendar.get(Calendar.MILLISECOND) + "";
		if(temp.length() == 1)
			temp = "00" + temp;
		if(temp.length() == 2)
			temp = "0" + temp;
		date = date + temp;
		return date;
	}
}
