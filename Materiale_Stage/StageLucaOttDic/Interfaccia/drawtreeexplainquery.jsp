<%@ page import="com.zucchetti.PortalStudio.*" %>
<%@ page import="com.zucchetti.sitepainter.Library" %>
<%@ page import="java.util.Properties" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//IT" "http://www.w3.org/TR/html4/strict.dtd">
<html lang="it"><head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<!-- css per IE8-->
		<link rel="stylesheet" type="text/css" media="screen" href="treedrawfile/cssIE8.css" />
        <title>Visualizzatore Piani</title>
		<script src="treeDrawFile/raphael.js" type="text/javascript" charset="cp1252"></script>
		<script src="../interface.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/RaphaelZPD.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/RaphaelAdapter.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/RaphaelZPDAdapter.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/MostraInfo.js" type="text/javascript" charset="cp1252"></script>	
		<script src="treeDrawFile/NodoLogico.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/NodoGrafico.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/AlberoBase.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/AlberoClassico.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/AlberoMisto.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/AlberoVerticale.js" type="text/javascript" charset="cp1252"></script>
		<script src="treeDrawFile/CreaAlbero.js" type="text/javascript" charset="cp1252"></script>
		<script src="../stdFunctions.js" type="text/javascript" charset="cp1252"></script>
		<script src="../controls.js" type="text/javascript" charset="cp1252"></script>
				
	</head>
		<body>
		</body>
	<script>
		document.body.innerHTML = "attendere risposta del server";
		//per internet Explorer 8 o inferiore non hanno indexOf (array) e trim (per pulizia stringhe
		if(!Array.indexOf){
			Array.prototype.indexOf = function(obj){
				for(var i=0; i<this.length; i++){
					if(this[i]==obj){
						return i;
					}
				}
				return -1;
			}
		}
		if(!String.trim) {
			String.prototype.trim = function() {
				return this.replace(/^\s+|\s+$/g, ""); 
			}
		}
		<%
			Properties params = Library.GetProperties(request.getParameter("m_cParams"));
            String cNumParams = params.getProperty("Rows");
			if(Library.Empty(cNumParams)) {
				cNumParams = "0";
			}
			int nNumParams = (int)Library.Val(cNumParams);
			String paramsValue = "";
			String paramsName = "";
			String sep="";
			for(int i=0;i<nNumParams;i++) {
				paramsName+=sep+Library.GetProperty(params,"field","",i);
				paramsValue+=sep+request.getParameter(Library.GetProperty(params,"field","",i));
				sep=",,"; //rivedere per separatore
			}
		%>	
		
		var paramsValue='<%=paramsValue%>';
		paramsValue=paramsValue.split(",,");
		var paramsName='<%=paramsName%>'
		paramsName=paramsName.split(",,");
		
		var params="";
		for (var i=0; i<paramsName.length; i++){
			params+="&"+paramsName[i]+"="+URLenc(paramsValue[i]);
		}
		

		var responseJSON = new JSURL("../servlet/SPVQRProxy?m_cWv="+URLenc('<%=JSPLib.ToJSValue(request.getParameter("m_cWv"))%>')+"&m_cParams="+URLenc('<%=JSPLib.ToJSValue(request.getParameter("m_cParams"))%>')+"&m_cAction="+URLenc('<%=JSPLib.ToJSValue(request.getParameter("m_cAction"))%>')+params,true);
		var JSONObj = responseJSON.Response();
		// dopo aver ricevuto la risposta dal server cancello ciò che e' presente nel body e poi creo i vari oggetti
		document.body.innerHTML = "";

		var corpo = document.getElementsByTagName("body");
		var divPadre = document.createElement("div");
		corpo[0].appendChild(divPadre);
		
		var menuSelect = document.createElement("select");
		menuSelect.setAttribute("id", "choiceMenu");
		divPadre.appendChild(menuSelect);
		
		var opzione = document.createElement("option");
		opzione.setAttribute("value", "Classico");
		opzione.innerHTML = "Classico";
		opzione.setAttribute("selected", "selected");
		menuSelect.appendChild(opzione);
		opzione = document.createElement("option");
		opzione.setAttribute("value", "Misto");
		opzione.innerHTML = "Misto";
		menuSelect.appendChild(opzione);
		opzione = document.createElement("option");
		opzione.setAttribute("value", "Verticale");
		opzione.innerHTML = "Verticale";
		menuSelect.appendChild(opzione);
		
		var button = document.createElement("input");
		button.setAttribute("type", "button");
		button.setAttribute("value", "Disegna Albero");
		button.setAttribute("selected", "selected");
		divPadre.appendChild(button);
		
		var divSpazioGrafico = document.createElement("div");
		divSpazioGrafico.setAttribute("id", "spazioPerGrafico");
		corpo[0].appendChild(divSpazioGrafico);
		
		//dopo aver creato i vari elementi disegno
		if(JSONObj.length != 0 && JSONObj.indexOf("ACCESS DENIED") == -1) {
			var JSONObj = eval('(' + JSONObj + ')' );
			var disegnatore = new CreaAlbero();
			disegnatore.init(JSONObj);
			disegnatore.ridisegnaAlbero("choiceMenu", "spazioPerGrafico");
			button.onclick = function() {
				disegnatore.ridisegnaAlbero("choiceMenu", "spazioPerGrafico");
				}
		}
		else {
			alert("Il plan della query \350 vuoto oppure non si hanno le credenziali d'accesso!");
		}
	</script>
</html>