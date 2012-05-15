package com.zucchetti.sitepainter.Analyzer.Model;

public class QueryPlan {
	private int DB;
	private String query;
	private InterfaceNodo tree;
	
	public int getDB() {
		return DB;
	}
	
	public String getQuery() {
		return query;
	}
	
	public InterfaceNodo getTree() {
		return tree;
	}
	
	public void queryExplained(int db, String q, InterfaceNodo t) {
		DB = db;
		query = q;
		tree = t;
	}
	
}
