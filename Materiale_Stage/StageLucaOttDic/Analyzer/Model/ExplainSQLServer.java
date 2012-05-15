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
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.lang.Math;

public class ExplainSQLServer implements ExplainInterface {
	
	private Nodo lista;//viene memorizzato temporaneamente l'albero
	private double totalCost;//valore 
	
	public Nodo explainQuery(String query, String contextID){
		if(query.equals("") || contextID.equals(""))
			return null;
		Sitepainter sp = new Sitepainter();
		sp.setContext(contextID);
		sp.requireTransaction();
		sp.queryDirect("SET SHOWPLAN_XML ON");
		SPJSPBridge.CPResultSet cprs = sp.queryDirect(query);
		sp.queryDirect("SET SHOWPLAN_XML OFF");
		sp.completeTransaction();
		if(!cprs.Eof())
			converti(cprs.GetColumnString(1));
		cprs.Close();
		return lista;
	}
	
	private void converti(String ris){
		if(ris.equals(""))
			return;
		Document doc = creaDOM(ris);
		lista = null;
		totalCost = 0;
		if(!doc.equals(null)){
			Node nodo = doc.getElementsByTagName("RelOp").item(0);//prendo il tag con il primo nodo
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
		NamedNodeMap attr = figlio.getAttributes();
		Node value=attr.getNamedItem("PhysicalOp");//cerco l'attributo che contiene il nome dell'operazione
		n.setCost(Double.parseDouble((attr.getNamedItem("EstimatedTotalSubtreeCost")).getNodeValue()));
		n.setRow(Math.ceil(Double.parseDouble((attr.getNamedItem("EstimateRows")).getNodeValue())));
		String nome = value.getNodeValue();
		n.setNome(nome);
		n.setPadre(padre);
		//l'operazione usa una tabella
		if(nome.equals("Constant Scan") || nome.equals("Index Scan") || nome.equals("Index Seek") || nome.equals("Clustered Index Seek") || nome.equals("Clustered Index Scan") || nome.equals("Nonclustered Index Seek") || nome.equals("Nonclustered Index Scan") || nome.equals("Table Scan")){
			Element nodo = (Element) figlio;//converto per poter cercare per nome dei tag
			NodeList figli = nodo.getElementsByTagName("Object");//cerca se esistono tag Object figli
			if(figli.getLength()!=0 && figli.item(0).getNodeName()=="Object"){
				String nomeTabella = figli.item(0).getAttributes().getNamedItem("Table").getNodeValue();
				nomeTabella = nomeTabella.substring(1, nomeTabella.length()-1);
				n.setTable(nomeTabella);
			}
			//filtro
			String filtro = "";
			figli = nodo.getElementsByTagName("Predicate");//cerca se esistono tag Predicate figli
			if(figli.getLength()!=0 && figli.item(0).getNodeName()=="Predicate"){
				Node predicate = figli.item(0);
				/*il primo dei nodi ScalarOperator contiene tutto il filtro, i figli di questo nodo contengono le singole parti
					del filtro, separando le operazioni con i vincoli logici (AND, OR, Like, ecc)*/
				figli = ((Element) predicate).getElementsByTagName("ScalarOperator"); 
				predicate = figli.item(0);
				if(predicate != null){
					filtro += predicate.getAttributes().getNamedItem("ScalarString").getNodeValue(); //del nodo ricavo gli attributi, prendo un certo attributo e ricavo il valore
				}
			}
			//filtro index al momento viene aggiunto se e solo se non c'è il tag predicate
			if(filtro.equals("")) {
				// ottengo la lista (composto solo da un elemento) dei SeekPredicates
				figli = nodo.getElementsByTagName("SeekPredicates");
				if(figli.getLength()!=0 && figli.item(0).getNodeName()=="SeekPredicates") {
					Node propIndex = figli.item(0);
					// ottengo la lista dei SeekPredicate <---- notare la s in meno
					figli = ((Element) propIndex).getElementsByTagName("SeekPredicate");
					//elenco le operazioni svolte basandosi sull'indice
					for(int i = 0; i < figli.getLength(); ++i) {
						NodeList propOpIndex = ((Element) figli.item(i)).getElementsByTagName("ScalarOperator");
						for(int j = 0; j < propOpIndex.getLength(); ++j) {
							NamedNodeMap attributes = propOpIndex.item(j).getAttributes();
							filtro += " " + attributes.getNamedItem("ScalarString").getNodeValue(); //qui al posto di spazio sarebbe da inserire l'operazione logica
						}
						filtro += " ";
					}
				}
				filtro = filtro.substring(1, filtro.length());
			}
			n.setPredicate(filtro);
		}
		if(padre==null){//non esiste il nodo padre -> questo è il nodo radice
			lista = n;//imposto questo come nodo radice
			totalCost = n.getCost();
			Element nodo = (Element) figlio;//converto per poter cercare per nome dei tag
			NodeList figli = nodo.getElementsByTagName("RelOp");//cerca se esistono tag RelOp figli
			if(figli.getLength()!=0 && figli.item(0).getNodeName()=="RelOp")
				inserisciNodo(figli.item(0), n);//se esiste almeno un figlio richiama questa funzione sul figlio e come padre mette questo nodo
			normalizeCosts(lista);
		}
		else{//else -> esiste già un nodo radice
			padre.addFiglio(n);//aggiungi questo figlio alla lista dei figli del padre
			if(figlio.getNextSibling()!=null){//controlla (nell'XML) se ci sono nodi fratelli di questo
				Node sibling = figlio.getNextSibling();//prendi il primo sibling del nodo corrente
				while(sibling!=null && !sibling.getNodeName().equals("RelOp"))//scorre tutti i sibling finchè non trova il primo tag plan o finisce i sibling
					sibling = sibling.getNextSibling();
				if(sibling!=null)//controlla se ha trovato il sibling
					inserisciNodo(sibling, padre);//invoca qusta funzione sul sibling
			}
			Element nodo = (Element) figlio;
			NodeList figli = nodo.getElementsByTagName("RelOp");//cerca se ci sono nodi figli (nell'XML) con tag plan
			if(figli.item(0)!=null)
				inserisciNodo(figli.item(0), n);//invoca sul primo figlio
		}
	}
	
	private void normalizeCosts(InterfaceNodo n) {
		if(n.getFigli().isEmpty()){
			((Nodo) n).setPerc((int)(Math.rint((n.getCost() * 100) / totalCost)));
			return;
		}
		for(int i = 0; i<n.getFigli().size(); i=i+1){
			((Nodo) n).setCost(n.getCost() - n.getFiglio(i).getCost());
			normalizeCosts(n.getFiglio(i));
		}
		((Nodo) n).setPerc((int)(Math.rint((n.getCost() * 100) / totalCost)));
	}

}
