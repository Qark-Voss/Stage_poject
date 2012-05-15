package com.zucchetti.sitepainter.Analyzer.Model;

import java.util.Vector;

public interface InterfaceNodo {
	public Vector<InterfaceNodo> getFigli();
	public InterfaceNodo getFiglio(int i);
	public InterfaceNodo getPadre();
	public String getPredicate();
	public double getCost();
	public int getPerc();
	public double getRow();
	public String getTable();
	public String getNome();
}
