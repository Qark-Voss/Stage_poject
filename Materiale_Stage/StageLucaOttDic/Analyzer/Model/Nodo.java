package com.zucchetti.sitepainter.Analyzer.Model;

import java.util.Vector;

public class Nodo implements InterfaceNodo {
	private Vector<InterfaceNodo> child = new Vector<InterfaceNodo>();
	private InterfaceNodo parent = null;
	private String predicate = "";
	private double cost;
	private int perc;
	private double row;
	private String table = "";
	private String name;
	
	public Nodo(){}
	
	public Vector<InterfaceNodo> getFigli() {return child;}
	public InterfaceNodo getFiglio(int i) {return child.elementAt(i);}
	public InterfaceNodo getPadre() {return parent;}
	public String getPredicate() {return predicate;}
	public double getCost() {return cost;}
	public int getPerc() {return perc;}
	public double getRow() {return row;}
	public String getTable() {return table;}
	public String getNome() {return name;}
	
	public void setNome(String n) {name = n;}
	public void setTable(String t) {table = t;}
	public void setPredicate(String p) {predicate = p;}
	public void setCost(double c) {cost = c;}
	public void setPerc(int p) {perc = p;}
	public void setRow(double r) {row = r;}
	public void setPadre(Nodo p) {parent = p;}
	public void addFiglio(Nodo f) {child.add(f);}
}
