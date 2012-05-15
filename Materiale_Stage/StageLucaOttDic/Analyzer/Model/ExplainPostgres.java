package com.zucchetti.sitepainter.Analyzer.Model;

import com.zucchetti.SPBridge.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class ExplainPostgres implements ExplainInterface {
	
	private Nodo lista;//viene memorizzato temporaneamente l'albero
	private double totalCost;//valore
	
	public Nodo explainQuery(String query, String contextID) {
		if(query.equals("") || contextID.equals(""))
			return null;
		lista = null;
		totalCost = 0;
		String explain = "EXPLAIN (FORMAT XML) " + query;
		Sitepainter sp = new Sitepainter();
		sp.setContext(contextID);
		SPJSPBridge.CPResultSet cprs = sp.queryDirect(explain);
		if(!cprs.Eof())
			converti(cprs.GetColumnString(1));
		cprs.Close();
		return lista;
	}
	
	private void converti(String ris) {
		if(ris.equals(""))
			return;
		Document doc = creaDOM(ris);
		if(!doc.equals(null)){
			Node nodo = doc.getElementsByTagName("Plan").item(0);
			inserisciNodo(nodo, lista);
		}
		return;
	}
	
	private Document creaDOM(String output) {
		Document doc = null;
		try{
			DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
			InputStream is = new ByteArrayInputStream(output.getBytes("UTF-8"));
			doc = dBuilder.parse(is);
			doc.getDocumentElement().normalize();
		}catch(Exception e){
			e.printStackTrace();
		}
		return doc;
	}
	
	private void inserisciNodo(Node figlio, Nodo padre) {
		Nodo n = new Nodo();
		Element plan = (Element) figlio;
		String name = getTagValue("Node-Type", plan);
		n.setNome(name);//recupera nome del nodo corrente
		n.setPadre(padre);
		
		//due if se ha indici allora è Index-Cond se non ne ha è Filter
		if(name.equals("Seq Scan") || name.equals("Bitmap Heap Scan")){
			n.setTable(getTagValue("Relation-Name", plan));
			String predicate = getTagValue("Filter", plan);
			n.setPredicate(predicate);
		}
		if(name.equals("Index Scan") ||  name.equals("Bitmap Index Scan")) {
			n.setTable(getTagValue("Relation-Name", plan));
			String filtro = "";
			//tag solo per operazioni su indici
			String predicate = getTagValue("Index-Cond", plan);
			filtro = predicate;
			predicate = getTagValue("Filter", plan);
			filtro += predicate;
			n.setPredicate(filtro);
		}
		
		n.setRow(Double.parseDouble(getTagValue("Plan-Rows", plan)));	
		double costoTot = Double.parseDouble(getTagValue("Total-Cost", plan));
		double costoStart = Double.parseDouble(getTagValue("Startup-Cost", plan));
		n.setCost(costoTot - costoStart);
		if(padre == null){//non esiste il nodo padre -> questo è il nodo radice
			lista = n;//imposto questo come nodo radice
			totalCost = Double.parseDouble(getTagValue("Total-Cost", plan));//inserisce il costo totale
			NodeList figli = plan.getElementsByTagName("Plan");//cerca se esistono tag plan figli
			if(figli.getLength()!=0)
				inserisciNodo(figli.item(0), n);//se esiste almeno un figlio richiama questa funzione sul figlio e come padre mette questo nodo
		}
		else{//else -> esiste già un nodo radice
			padre.addFiglio(n);//aggiungi questo figlio alla lista dei figli del padre
			if(plan.getNextSibling()!=null){//controlla (nell'XML) se ci sono nodi fratelli di questo
				Node sibling = plan.getNextSibling();//prendi il primo sibling del nodo corrente
				while(sibling!=null && !sibling.getNodeName().equals("Plan"))//scorre tutti i sibling finchè non trova il primo tag plan o finisce i sibling
					sibling = sibling.getNextSibling();
				if(sibling!=null)//controlla se ha trovato il sibling
					inserisciNodo(sibling, padre);//invoca questa funzione sul sibling
			}
			NodeList figli = plan.getElementsByTagName("Plan");//cerca se ci sono nodi figli (nell'XML) con tag plan
			if(figli.item(0)!=null)
				inserisciNodo(figli.item(0), n);//invoca sul primo figlio
		}
		if(costoStart == 0 && n.getFigli().size() != 0){
			double cost = 0;
			for(int i=0; i<n.getFigli().size(); i=i+1)
				cost = cost + findSubTreeCost(n.getFiglio(i));
			n.setCost(costoTot - cost);	
		}
		n.setPerc((int)(Math.rint((n.getCost() * 100) / totalCost)));
	}
	
	private double findSubTreeCost(InterfaceNodo n) {
		double cost = 0;
		if(n == null)
			return cost;
		if(!n.getFigli().isEmpty())
			for(int i=0; i<n.getFigli().size(); i=i+1)
				cost = cost + findSubTreeCost(n.getFiglio(i));
		return cost + n.getCost();
	}
	
	private static String getTagValue(String sTag, Element eElement) {
		if(eElement == null)
			return "";
		NodeList nlList = eElement.getElementsByTagName(sTag);
		
		if(nlList == null || nlList.item(0) == null) {
			return "";
		}
		nlList = nlList.item(0).getChildNodes();
		Node nValue = (Node) nlList.item(0);
		return nValue.getNodeValue();
	}

}
