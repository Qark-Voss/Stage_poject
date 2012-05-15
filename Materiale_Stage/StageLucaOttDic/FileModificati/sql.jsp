<%@ page import="com.zucchetti.SPBridge.*" %>
<%@ page import="com.zucchetti.PortalStudio.*" %>
<%
  Sitepainter sp=new Sitepainter(request);
  sp.setContentType(response);
%><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title></title>
<script type="text/javascript" src="../stdFunctions.js"></script>
<script type="text/javascript" src="../controls.js"></script>
<script type="text/javascript">
var parameters = window.opener.GetParametersArray();

function DoLoad() {
  Ctrl("m_cWv").value = window.opener.FillVQRVariables('save');
  Ctrl("m_cAction").value = window.opener.sqlOperation;
  Ctrl("m_lShowAll").value = window.opener.showAll;
  if (Ctrl("m_cAction").value=='sqlAnalyze') Ctrl("FormSender").action="drawtreeexplainquery.jsp"
  if (parameters.length == 0) {
    Ctrl("FormSender").submit();
  } else {
    var html = "<h3>Select Parameters</h3><table>";

    for (var i=0; i<parameters.length; i++){
      html += "<tr><td align='right' style='font-size:12;font-weight:bold'>" + parameters[i][1] + ":</td><td>";

      switch (parameters[i][2].charAt(0)){
      case "L":
        html += "<select name='" + parameters[i][0] + "'><option value=''> </option><option value='true'>True</option><option value='false'>False</option></select>"
        break;
      case "D":
        html += "<input type='text' size='10' maxlength='10' name='" + parameters[i][0] + "' onblur=\"onblur_d(this)\" onfocus=\"onfocus_d(this); this.select()\">"
        break;
      case "T":
        html += "<input type='text' size='19' maxlength='19' name='" + parameters[i][0] + "' onblur=\"onblur_t(this)\" onfocus=\"onfocus_t(this); this.select()\">"
        break;
      case "N":
        var size = parseInt(parameters[i][3]);
        html += "<input type='text' size='" + Math.min(size, 40) + "' maxlength='" + size + "' name='" + parameters[i][0] + "' onfocus=\"this.select()\">"
        break;
      case "M":
        html += "<textarea name='"+parameters[i][0]+"' cols='20' rows='3' style='width:300px;height:60px;'></textarea>"
        break;
      default:
        var size = parseInt(parameters[i][3]);
        html += "<input type='text' size='" + Math.min(size, 40) + "' maxlength='" + size + "' name='" + parameters[i][0] + "' onfocus=\"this.select()\">"
        break;
      }
      html += "</td></tr>";
    }
    html += "</table>";
    Ctrl("paramValues").innerHTML = html;

    for (var i=0; i<parameters.length; i++){
      switch (parameters[i][2]){
        case "N":
          Ctrl(parameters[i][0]).onkeypress = CheckNum;
          break;
        case "D":
        case "T":
          Ctrl(parameters[i][0]).onkeypress = CheckDateChar;
          break;
      }
    }
    //Il DIV era nascosto per nascondere gli input nel caso di non neccesita di usarli
    //quando non ci sono parametri nella query
    Ctrl("FormDiv").style.display = "block";
    //Metto il focus nel primo input
    Ctrl(parameters[0][0]).focus();
    FillParameterProps();
    decSep='.';//fix, i numeri devono avere il separatore con il . perche' altrimenti la parseDouble server side da errore
  }
}

function onblur_d(obj){
  obj.value = ApplyPictureToDate(obj.value,'DD-MM-YYYY')
}

function onblur_t(obj){
  obj.value = ApplyPictureToDateTime(obj.value,'DD-MM-YYYY hh:mm:ss')
}

function onfocus_d(obj){
  obj.value = ApplyPictureToDate(obj.value,'DDMMYYYY')
}
function onfocus_t(obj){
  obj.value = ApplyPictureToDateTime(obj.value,'DDMMYYYYhhmmss')
}

function FillParameterProps(){
  var l_oParameters = new TrsJavascript();
  l_oParameters.reset();
  l_oParameters.SetRow(0);

  for (var i=0; i<parameters.length; i++) {
    l_oParameters.setValue('field', WtA(parameters[i][0], 'C'));
    l_oParameters.setValue('desc', WtA(parameters[i][1], 'C'));
    l_oParameters.setValue('type', WtA(parameters[i][2], 'C'));
    l_oParameters.setValue('len', WtA(parameters[i][3], 'C'));
    l_oParameters.setValue('dec', WtA(parameters[i][4], 'C'));
    l_oParameters.setValue('remove', WtA((parameters[i][5] ? "Remove" : ""), 'C'));
    l_oParameters.SetRow(i+1);
  }
  Ctrl("m_cParams").value = l_oParameters.asString();
}

</script>
</head>

<body onload="DoLoad()" bgcolor="#D6D6CE" style="font-family:verdana">
 <div id="FormDiv" style="display:none">
  <form id="FormSender" name="FormSender" style="margin:0" method="post" action="../servlet/SPVQRProxy">
  <div id="paramValues"></div>
  <input name="m_cWv" type="hidden" value="">
  <input name="m_cParams" type="hidden" value="">
  <input name="m_cAction" type="hidden" value="sqlPhrase">
  <input name="m_lShowAll" type="hidden" value="">
  <br>
  <input type="submit" value=" Ok ">
  <input type="button" onclick="self.close()" value="Cancel">
  </form>
 </div>
</body>

</html>
