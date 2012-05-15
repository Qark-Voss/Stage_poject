import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FilenameFilter;
import java.io.FileNotFoundException;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.net.ConnectException;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.HttpURLConnection;
import java.net.UnknownHostException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Pattern;
import javax.net.ssl.SSLHandshakeException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.ws.Service;
import javax.xml.namespace.QName;
import com.zucchetti.sitepainter.Library;
import org.json.JSONArray;
import java.util.ArrayList;

public class SPVQRProxy extends SPServlet implements SPInvokable {

  public class ServletStatus {
    CPContext context;
  }

  public static boolean m_bCheckUser;
  public static int m_iRemoteRequestTimeout;
  public static Pattern WEB_SERVICE_CLIENT_CONTENT_TYPE_PATTERN;
  public static String WEB_SERVICE_CLIENT_CONTENT_TYPE,
                       WEB_SERVICE_CLIENT_CONTENT_HEADER,
                       WEB_SERVICE_CLIENT_CONTENT_HEADER_VALUE;

  static String filter;

  private static String WEB_SERVICE_CLIENT_CONTENT_TYPE_RE;

  static {
    m_bCheckUser = true;
    m_iRemoteRequestTimeout = 5000;
    WEB_SERVICE_CLIENT_CONTENT_HEADER = "SPServerCallerHeader";
    WEB_SERVICE_CLIENT_CONTENT_HEADER_VALUE = "dummy";
    WEB_SERVICE_CLIENT_CONTENT_TYPE = "application/x-www-form-urlencoded";
    WEB_SERVICE_CLIENT_CONTENT_TYPE_RE = "^"+WEB_SERVICE_CLIENT_CONTENT_TYPE+".*";

    Library.initFromConfig(SPVQRProxy.class,"SPVQRProxy");

    WEB_SERVICE_CLIENT_CONTENT_TYPE_PATTERN = Pattern.compile(WEB_SERVICE_CLIENT_CONTENT_TYPE_RE);
  }

  public void doPost(HttpServletRequest request,
                        HttpServletResponse response) throws IOException, ServletException {
    if ( fromRemote(request) ) {
      //request.setCharacterEncoding("UTF-8");
      this.doProcess(request, response);
    } else {
      super.doPost(request, response);
    }
  }

  public void doProcess(HttpServletRequest request,
                        HttpServletResponse response) throws IOException, ServletException {

    String pAction;
    SPParameterSource source;
    final ServletStatus status = new ServletStatus();
    status.context = SPLib.GetContext(SPLib.GetContextID(request),request);

    filter = SPLib.GetParameter(request,"filter","");
    pAction = request.getParameter("action");
    source = SPLib.GetSource(request);
    SPLib.SetContentType(response);
    PrintWriter out = response.getWriter();

    if(Library.Empty(pAction)) {
      pAction = source.GetParameter("m_cAction","");
    }

    if ( !canAccessEditor(status, request, response) ) {
      if(pAction.equalsIgnoreCase("vqr") || pAction.equalsIgnoreCase("exists")) {
        out.print("['"+status.context.Translate("MSG_ACC_NOT_ALLOWED")+"']");
      }
      else {
        out.print("<html>");
        out.print("<head>");
        out.print("<title>"+status.context.Translate("MSG_ACC_NOT_ALLOWED")+"</title>");
        out.print("<script type='text/javascript'>");
        out.print("var m_cStatus = 'ACCESS DENIED';");
        out.print("</script>");
        out.print("</head>");
        out.println("<body bgcolor=\"#D6D6CE\" style=\"font-family:verdana;font-size:12;font-weight:bold;align:center\">");
        out.println("<div align='center'>"+status.context.Translate("MSG_ACC_NOT_ALLOWED")+"</div>");
        out.println("</body>");
        out.print("</html>");
      }
    }
    else {

      //System.out.println(">>>>> Action >>>>> "+pAction);

      if(!Library.Empty(pAction)) {
        //---------------- Save -----------------
        if(pAction.equalsIgnoreCase("save")) {
          String pFilename = CPLib.Lower(source.GetParameter("m_cFilename",""));

          //out.print("<html>");
          //out.print("<head>");
          //out.print("<title></title>");
          //out.print("<script type='text/javascript'>");

          if(!Library.Empty(pFilename)) {
            int currentVersion, savedVersion;
            String nullString=null;
            String m_cWv = source.GetParameter("m_cWv",nullString);
            if ( m_cWv != null ){
              VQRReader vqrReader = new VQRReaderDirect(pFilename, new SPVQRReaderFactory(), false);
              if(Library.Empty(vqrReader.GetReadingError())){
                savedVersion=-1;
                currentVersion=-1;
              }
              else {
                Properties p;

                try {
                  vqrReader.ExtractTables();
                  vqrReader.ExtractFields();
                  vqrReader.ExtractRelations();
                  vqrReader.ExtractWheres();
                  vqrReader.ExtractOrderBy();
                  vqrReader.ExtractGroupBy();
                  vqrReader.ExtractDistinct();
                  vqrReader.ExtractParam();
                  vqrReader.ExtractExtMask();
                  vqrReader.ExtractRemoveFilterOnEmptyParam();
                  vqrReader.ExtractUnion();
                  vqrReader.ExtractPivotFields();
                  vqrReader.ExtractPivotData();
                  vqrReader.ExtractNote();
                  vqrReader.ExtractUnionAll();
                  vqrReader.ExtractUseOrderByParam();
                  p=vqrReader.ExtractVersion();
                  vqrReader.EndExtraction();
                  savedVersion = (int)CPLib.GetProperty(p,"version",0,0);
                } catch(Exception e) {
                  savedVersion=-1;
                }
                currentVersion = (int)CPLib.GetProperty(CPLib.GetProperties(m_cWv),"version",0,0);
              }

              if(savedVersion==-1 || currentVersion==savedVersion+1){
                VQRWriter vqr = new VQRWriter(Library.GetClassesPath()+File.separator+"query"+File.separator, pFilename);
                if (!vqr.WriteVQRFile(m_cWv)) {
                  QueryLoader.UnvalidateCachedVQR(pFilename);
                  //out.print("window.parent.NotifySave('ok');");
                  out.print("ok");
                  //spedisce al Frontend la notifica dell'avvenuto salvataggio
                  try {
                    Socket s=new Socket();
                    SocketAddress sa=new InetSocketAddress("localhost",54019);
                    s.connect(sa);
                    OutputStream outToSP=s.getOutputStream();
                    outToSP.write(("visualquery "+pFilename+"\0").getBytes());
                    outToSP.flush();
                    s.close();
                  } catch (Exception e) {
                  }
                }
                else {
                  Library.error(new Error("Unable to save vqr file."));
                  out.print("error");
                }
              }
              else {
                out.print(status.context.Translate("MSG_QUERY_MOD_OTHER_USER"));
              }
            }
            else {
              out.print("error");
              // Inserito errore nei contatori standard segnalato precedentemente solo dal tomcat.
              // Il parametro m_cWv risultava vuoto in caso di inserimento errato dei dati
              // (es. senza URLenc dell'intervento 1869 su visualquery.js inserendo %& nel campo user)
              // e la query veniva salvata vuota senza segnalare l'errore.
              Library.error(new Error("Character decoding failed for parameter m_cWv."));
            }
          }
          else {
            out.print("no_filename");
          }

          //out.print("</script>");
          //out.print("</head>");
          //out.print("</html>");
        }
        //---------------- Open -----------------
        else if(pAction.equalsIgnoreCase("open")) {
          String res, pFilename = request.getParameter("filename");

          if(!Library.Empty(pFilename)) {
            ByteArrayOutputStream bVqr = new ByteArrayOutputStream();
            VQRReader vqrReader = new VQRReaderDirect(pFilename, new SPVQRReaderFactory());
            Properties pVqr = new Properties();
            try {
              Properties p;
              ByteArrayOutputStream b;

              p = vqrReader.ExtractTables();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#tables", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractFields();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#fields", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractRelations();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#relations", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractWheres();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#filters", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractOrderBy();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#orderby", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractGroupBy();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#groupby", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractDistinct();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#distinct", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractParam();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#parameters", CPLib.ToProperties(b.toString()));

              vqrReader.ExtractExtMask().toString();

              p = vqrReader.ExtractRemoveFilterOnEmptyParam();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#remove_filter", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractUnion();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#union", CPLib.ToProperties(b.toString()));

              vqrReader.ExtractPivotData().toString();
              vqrReader.ExtractPivotFields().toString();

              p = vqrReader.ExtractNote();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#notes", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractUnionAll();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#union_all", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractUseOrderByParam();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#use_orderby", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractVersion();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#version", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractMultiCompany();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#multi_company", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractSecurityRoles();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#security_roles", CPLib.ToProperties(b.toString()));

              p = vqrReader.ExtractAccessibility();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              pVqr.setProperty("0#accessibility", CPLib.ToProperties(b.toString()));

              vqrReader.EndExtraction();

              pVqr.store(bVqr,"");
              res=bVqr.toString();
            } catch(Exception e) {
              res="";
            }
            out.print(res);
          }
        }
        //---------------- Exists -----------------
        else if(pAction.equalsIgnoreCase("exists")) {
          final String EXIST = "1";
          final String NOT_EXIST = "0";
          final String ERROR = "-1";// unused
          String p_cVqrName = source.GetParameter("m_cFilename","");
          if(!Library.Empty(p_cVqrName)) {

            String l_cCp = Library.GetClassesPath()+File.separator+"query"+File.separator;// la dir dove cercare

            String lc = p_cVqrName.toLowerCase(),uc=p_cVqrName.toUpperCase();
            String[] tries = new String[]{//le combinazioni di case
              p_cVqrName+".vqr",
              lc+".vqr",
              uc+".vqr",
              p_cVqrName+".VQR",
              lc+".VQR",
              uc+".VQR",
            };
            //Cerco il file VQR
            boolean found = false;
            for(int i=0; i<tries.length && !found; i++) {
              found = new File(l_cCp+tries[i]).exists();
            }

            out.print(found ? EXIST : NOT_EXIST);
          }
          else {
            out.print(ERROR);
          }
        }
        //---------------- File list -----------------
        else if(pAction.equalsIgnoreCase("vqr")) {
          if ( toRemote(request, source) ) {
            if ( "native".equals(getRemoteProp(request, source, "remote_mode", "native"))  ) {
              doItRemoteNative(request, source, response);
            } else {
              //Not implemented
              out.print("['Not implemented']");
            }
          }
          else {
            JSONArray jsonVQRs = new JSONArray();
            String l_cCp=Library.GetClassesPath()+File.separator+"query";
            File m_ClassesPath=new File(l_cCp);
            if (m_ClassesPath.exists()) {
              try {

                class VQRsPickerAsFilter implements FilenameFilter{//accumula i nomi man mano che vengono trovati
                  Vector<String> vqrFilenames; //accumulatore
                  Pattern pFilter;

                  VQRsPickerAsFilter(){
                    this(new Vector<String>());
                  }

                  VQRsPickerAsFilter(Vector<String> vqrFilenames){
                    this.vqrFilenames = vqrFilenames;
                    boolean viewSPQuery = !status.context.HasAdministeredUsers() || CPLib.IsAdministrator(status.context)
                      || !m_bCheckUser;

                    String filter_re = ".*"+filter.toUpperCase().replaceAll("\\.","\\\\.").replaceAll("\\?",".").replaceAll("\\*",".*")+".*VQR$";
                    filter_re = ( viewSPQuery ? "(SPQUERY_)?": "(?!(SPQUERY_))" ) + filter_re;
                    pFilter = Pattern.compile(filter_re);
                  }

                  public boolean accept(File dir,String name) {
                    if(pFilter.matcher(name.toUpperCase()).matches()) {
                      vqrFilenames.add(name);
                    }
                    return false;
                  }

                  public Vector<String> getVQRs(){
                    return vqrFilenames;
                  }
                }

                Vector<String> vqrFilenames = new Vector<String>();
                m_ClassesPath.listFiles(new VQRsPickerAsFilter(vqrFilenames)); //lista i files e si ricorda quanti ne ha trovati
                //ordina i files trovati
                String[] aVqrFilenames = new String[vqrFilenames.size()];
                vqrFilenames.toArray(aVqrFilenames);

                Arrays.sort(aVqrFilenames, new Comparator<String>(){//compara ignorando il case (in caso di parità usa il case)
                  public int compare(String o1, String o2) {
                    int res = o1.compareToIgnoreCase(o2);
                    if(res == 0) {
                      return o1.compareTo(o2);
                    }
                    return res;
                  }
                  public boolean equals(Object obj) {
                    return false;
                  }
                });

                jsonVQRs = new JSONArray((Object)aVqrFilenames);//crea array JSON

              } catch(Exception e) {
                CPStdCounter.Error(e);
              }
            }
            else {
              CPStdCounter.Error(new RuntimeException("Unable to list Visual Query files: file '"+l_cCp+"' does not exist."));
            }
            try{
              jsonVQRs.write(out);
            } catch(Exception e) {
              CPStdCounter.Error(e);
              out.print("['Unexpected error: details reported to standard counters.']");
            }
          }
        }
        //---------------- File fields -----------------
        else if(pAction.equalsIgnoreCase("fields")) {
          String res = null, pFilename = request.getParameter("filename");
          Properties p = null;

          if (Library.Empty(pFilename)) {
          } else if(SQLDataProviderServer.RoutineExpected(pFilename)) {
            Object l_Sample = null;
            String[] l_Names = null, l_Types = null, l_Descriptions = null;
            try {
              Method[] MakeRun = new Method[2];
              SQLDataProviderServer.RoutineQueryMethodsParameters(pFilename, MakeRun, null);
              Class l_MCR = MakeRun[1].getReturnType();
              l_Sample = l_MCR.newInstance();
            } catch(Exception notWorking) {
              Library.error(notWorking);
            }
            if (l_Sample == null) {
              res = "['Unexpected error: ','    Error details reported to standard counters.']";
            } if (l_Sample instanceof CPMemoryCursor) {
              l_Names = ((CPMemoryCursor)l_Sample).GetColumnNames();
              l_Types = ((CPMemoryCursor)l_Sample).CurrentRow().GetColumnTypes();
              l_Descriptions = ((CPMemoryCursor)l_Sample).CurrentRow().GetColumnDescriptions();
            } else if (l_Sample instanceof CPMemoryCursorRow) {
              l_Names = ((CPMemoryCursorRow)l_Sample).GetColumnNames();
              l_Types = ((CPMemoryCursorRow)l_Sample).GetColumnTypes();
              l_Descriptions = ((CPMemoryCursorRow)l_Sample).GetColumnDescriptions();
            }
            if (l_Sample == null) {
            } else if (l_Names == null) {
              res = "['Unexpected error:','    "+pFilename+" doesn't return a Row or MemoryCursor but "+l_Sample+".']";
            } else if (l_Names.length == 0) {
              res = "['Unexpected error:','    "+l_Sample+" must be regenerated.']";
            } else {
              p = new Properties();
              Pattern l_Allowed = Pattern.compile("[CNMLDT]");
              for (int i = 0; i < l_Names.length; i++) if (l_Allowed.matcher(l_Types[i]).matches()) {
                XDCHolder.AddFieldDef(p,
                                      i,
                                      pFilename,
                                      l_Names[i],
                                      l_Names[i],
                                      l_Types[i],
                                      0,
                                      0,
                                      l_Descriptions[i]);
              }
              p.put("0#Rows", CPLib.ToProperties(l_Names.length));
            }
          } else if(CPLib.eq(CPLib.Upper(Library.Left(pFilename,3)),"BO:")){
            res = "BO_QUERY:"+CPLib.GetXDCHolder(Library.GetClassesPath(),new SPXDCReaderFactory(status.context.GetInstance()),status.context.GetInstance()).GetFieldsString(pFilename);
          } else {
            VQRHolder h = new VQRHolder(pFilename, new SPVQRReaderFactory());
            if (!h.Error())
              p = h.GetVqrFieldsAsProperties();
            else
              res = h.ErrorMessage();
          }
          if (p != null) try {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            p.store(b,"");
            out.print(b.toString());
          } catch(Exception e) {
            out.print("");
          } else if (res != null) {
            out.print(res);
          }
        }
        //---------------- File filters -----------------
        else if(pAction.equalsIgnoreCase("filters")) {
          String res, pFilename = request.getParameter("filename");

          if(!Library.Empty(pFilename)) {
            VQRReader vqrReader = new VQRReaderDirect(pFilename, new SPVQRReaderFactory());
            ByteArrayOutputStream b;
            Properties p;

            try {
              vqrReader.ExtractTables();
              vqrReader.ExtractFields();
              vqrReader.ExtractRelations();
              p = vqrReader.ExtractWheres();
              vqrReader.EndExtraction();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              res=b.toString();
            } catch(Exception e) {
              res="";
            }
            out.print(res);
          }
        }
        //---------------- File parameters -----------------
        else if(pAction.equalsIgnoreCase("parameters")) {
          String res, pFilename = request.getParameter("filename");

          if(!Library.Empty(pFilename)) {
            VQRReader vqrReader = new VQRReaderDirect(pFilename, new SPVQRReaderFactory());
            ByteArrayOutputStream b;
            Properties p;

            try {
              vqrReader.ExtractTables();
              vqrReader.ExtractFields();
              vqrReader.ExtractRelations();
              vqrReader.ExtractWheres();
              vqrReader.ExtractOrderBy();
              vqrReader.ExtractGroupBy();
              vqrReader.ExtractDistinct();
              p = vqrReader.ExtractParam();
              vqrReader.EndExtraction();
              b = new ByteArrayOutputStream();
              p.store(b,"");
              res=b.toString();
            } catch(Exception e) {
              res="";
            }
            out.print(res);
          }
        }
         else if(pAction.equalsIgnoreCase("allParameters")) {
          String res, pFilename = request.getParameter("filename");
          if(!Library.Empty(pFilename)) {
            ByteArrayOutputStream b;
            try{
              ArrayList<Properties> propertiesArray=getAllParameters(pFilename);
              
              // faccio il merge tra tutti gli oggetti Properties dell'arrayList
              Properties p=propertiesArray.get(0);
              int numRows=Integer.parseInt((CPLib.GetProperty(propertiesArray.get(0),"Rows","",0)));
              for (int i=1; i<propertiesArray.size(); i++){
                Properties pTmp=propertiesArray.get(i);
                int numRowsTmp=Integer.parseInt((CPLib.GetProperty(pTmp,"Rows","",0)));
                for (int j=0; j<numRowsTmp; j++){
                  p.setProperty((numRows+j)+"#field",CPLib.GetProperty(pTmp,"field","",j));
                  p.setProperty((numRows+j)+"#desc",CPLib.GetProperty(pTmp,"desc","",j));
                  p.setProperty((numRows+j)+"#type",CPLib.GetProperty(pTmp,"type","",j));
                  p.setProperty((numRows+j)+"#len",CPLib.GetProperty(pTmp,"len","",j));
                  p.setProperty((numRows+j)+"#dec",CPLib.GetProperty(pTmp,"dec","",j));
                }
                numRows+=numRowsTmp;
              }
              p.setProperty("0#Rows",((Integer)numRows).toString());
              b = new ByteArrayOutputStream();
              p.store(b,"");
              res=b.toString();
            }
            catch(Exception e){
              res="";
            }
            out.print(res);
          }
        }
        else if(pAction.equalsIgnoreCase("notes")) {
          String res, pFilename = request.getParameter("filename");

          if(!Library.Empty(pFilename)) {
            VQRReader vqrReader = new VQRReaderDirect(pFilename, new SPVQRReaderFactory());
            ByteArrayOutputStream b;
            Properties p;

            try {
              vqrReader.ExtractTables();
              vqrReader.ExtractFields();
              vqrReader.ExtractRelations();
              vqrReader.ExtractWheres();
              vqrReader.ExtractOrderBy();
              vqrReader.ExtractGroupBy();
              vqrReader.ExtractDistinct();
              vqrReader.ExtractParam();
              vqrReader.ExtractExtMask();
              vqrReader.ExtractRemoveFilterOnEmptyParam();
              vqrReader.ExtractUnion();
              vqrReader.ExtractPivotFields();
              vqrReader.ExtractPivotData();
              p = vqrReader.ExtractNote();
              vqrReader.EndExtraction();
              res = CPLib.GetProperty(p,"notes","",0);
            } catch(Exception e) {
              res="";
            }
            out.print(res);
          }
        }
        //---------------- SQL Phrase -----------------
        else if(pAction.equalsIgnoreCase("sqlphrase") || pAction.equalsIgnoreCase("sqlquery") || pAction.equalsIgnoreCase("sqlanalyze")) {
          String queryPath, filename, m_cWv, m_cParams, pName, pNameCaller, sqlPhrase = "";
          Properties params;
          boolean isQueryFile=false;

          m_cWv = source.GetParameter("m_cWv","");
          m_cParams = source.GetParameter("m_cParams","");

          // controlla se è un test di query esitente
          isQueryFile = "*VQR*".equals(m_cWv.substring(0,5));

          //Trovo tutti i parameteri usati nella query
          params = CPLib.GetProperties(m_cParams);
          String cNumParams = params.getProperty("Rows");
          if(Library.Empty(cNumParams)) {
            cNumParams = "0";
          }
          int nNumParams = (int)Library.Val(cNumParams);

          Caller caller = new MyCaller();
          if ( toRemote(request, source) && "native".equals(getRemoteProp(request, source, "remote_mode", "native")) ) {
            caller.SetString("m_cParams", "C", m_cParams.length(), 0, m_cParams);
          }
          //Carico il caller con i parameteri ed i loro valori dal form
          for(int i=0;i<nNumParams;i++) {
            pName = pNameCaller = CPLib.GetProperty(params,"field","",i);

            if(Library.At("w_", pName)==1)
              pNameCaller = Library.Substr(pName, 3); //Tolgo la w_

            switch(CPLib.Lower(CPLib.GetProperty(params,"type","",i)).charAt(0)) {
              case 'c':
              case 'm':
                caller.SetString(pNameCaller,"C",(int)Library.Val(CPLib.GetProperty(params,"len","",i)),(int)Library.Val(CPLib.GetProperty(params,"dec","",i)),source.GetParameter(pName,""));
                break;
              case 'n':
                caller.SetNumber(pNameCaller,"N",(int)Library.Val(CPLib.GetProperty(params,"len","",i)),(int)Library.Val(CPLib.GetProperty(params,"dec","",i)),source.GetParameter(pName,0));
                break;
              case 'l':
                caller.SetLogic(pNameCaller,"L",(int)Library.Val(CPLib.GetProperty(params,"len","",i)),(int)Library.Val(CPLib.GetProperty(params,"dec","",i)),source.GetParameter(pName,false));
                break;
              case 'd':
                caller.SetDate(pNameCaller,"D",(int)Library.Val(CPLib.GetProperty(params,"len","",i)),(int)Library.Val(CPLib.GetProperty(params,"dec","",i)),source.GetParameter(pName,CPLib.NullDate()));
                break;
              case 't':
                caller.SetDateTime(pNameCaller,"T",(int)Library.Val(CPLib.GetProperty(params,"len","",i)),(int)Library.Val(CPLib.GetProperty(params,"dec","",i)),source.GetParameter(pName,CPLib.NullDateTime()));
                break;
            }
          }
          queryPath = Library.GetClassesPath()+File.separator+"query"+File.separator;
          if (isQueryFile) {
            filename=m_cWv.substring(5);
          } else {
            //Salvo la query in un file temporaneo
            filename = "cptmp_"+CPLib.NewCPCCCHK();
            VQRWriter vqrWriter = new VQRWriter(queryPath, filename);
            if (vqrWriter.WriteVQRFile(m_cWv)) {
              CPStdCounter.Error(new Exception("Unable to create temp file for VQR preview."));
            }
          }

          //Creo l'oggetto VQRHolder per decodifiacre il file e avere la frase SQL
          //aggiunto il true per poter vedere il risultato delle query con sicurezza "Routine"
          VQRHolder vqrHolder = new VQRHolder(filename, new SPVQRReaderFactory(), caller, true);
          caller.SetString("m_cVQRList","C",0,0,","+filename+",");
          //Alla fine, cancello il file temporaneo
          if (!isQueryFile){
            try {
              File tempFile = new File(queryPath+filename+".vqr");
              tempFile.delete();
              tempFile = null;
            } catch(Exception e){
              CPStdCounter.Error(new Exception("Unable to delete temp file after VQR preview."));
            }
          }
          //System.out.println(">>>>> Start Writing >>>>> "+pAction);
          if(pAction.equalsIgnoreCase("sqlphrase")) {
            //Restituisco una pagina HTML con la frase SQL
            sqlPhrase = vqrHolder.GetQuery(status.context);
            sqlPhrase = SPLib.ToHTMLRepresentation(SPLib.ToHTML(sqlPhrase,"C",0,0)); //simbolo del euro in particolare

            sqlPhrase = Library.Strtran(sqlPhrase, "SELECT ", "<span class='KeyWord'>SELECT</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " AS ", " <span class='KeyWord'>AS</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " FROM ", " <span class='KeyWord'>FROM</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " JOIN ", " <span class='KeyWord'>JOIN</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " ON ", " <span class='KeyWord'>ON</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " WHERE ", " <span class='KeyWord'>WHERE</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " HAVING ", " <span class='KeyWord'>HAVING</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " AND ", " <span class='KeyWord'>AND</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " OR ", " <span class='KeyWord'>OR</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " GROUP BY ", " <span class='KeyWord'>GROUP BY</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " ORDER BY ", " <span class='KeyWord'>ORDER BY</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " UNION ALL ", " <span class='KeyWord'>UNION ALL</span> ");
            sqlPhrase = Library.Strtran(sqlPhrase, " UNION ", " <span class='KeyWord'>UNION</span> ");

            out.println("<html>");
            out.println("<head>");
            out.println("<title>SQL Phrase</title>");
            out.println("<style>");
            out.println(".KeyWord {font-weight:bold;color:blue}");
            out.println("</style>");
            out.println("</head>");
            out.println("<body style='font-family:verdana;font-size:10pt;background-color:#D6D6CE'>");
            out.println(sqlPhrase);
            out.println("</body>");
            out.println("</html>");
          }
          else if (pAction.equalsIgnoreCase("sqlquery")) {
            //Restituisco una pagina HTML con i risultati della Query
            boolean m_lShowAll = source.GetParameter("m_lShowAll",false);
            long executiontime = System.currentTimeMillis();
            CPResultSet rs = vqrHolder.GetResultSet(status.context);
            executiontime = System.currentTimeMillis() - executiontime;
            out.println("<html>");
            out.println("<head>");
            out.println("<title>SQL Execute</title>");
            out.println("<style type='text/css'>");
            out.println("td { background-color:#E7E7E2; }");
            out.println("</style>");
            out.println("</head>");
            out.println("<body style='font-family:verdana;background-color:#D6D6CE'>");

            if(rs.ErrorMessage()!=null) {
              out.println("<div id='sqlerror' style='font-size:9pt;font-weight:bold'>");
              out.println(SPLib.ToHTMLRepresentation(SPLib.ToHTML(rs.ErrorMessage(),"C",0,0)));
              out.println("</div>");
            }
            else {
              int numRows=0, numCols = rs.GetColumnCount();
              out.println("<table style='font-size:8.5pt;background-color:black' cellspacing='1'>");
              out.print("<tr style='font-size:10pt;font-weight:bold'>");

              //Inserisco i titoli delle colonne
              for (int i=1;i<=numCols;i++) {
                out.print("<td align='center'>&nbsp;"+rs.GetColumnName(i)+"&nbsp;</td>");
              }
              out.println("</tr>");

              while(!(rs.Eof() || (!m_lShowAll && numRows==100))) {
                out.print("<tr>");

                for(int i=1;i<=numCols;i++) {
                  if(rs.GetColumnCPType(i).startsWith("M"))
                    out.print("<td nowrap style='font-style:italic' title='"+ToHTML(Library.Len(rs.GetColumnString(i))>150?Library.Substr(rs.GetColumnString(i),1,150)+"....":rs.GetColumnString(i))+"'>&nbsp; memo &nbsp;</td>");
                  else if(rs.GetColumnCPType(i).startsWith("N"))
                    out.print("<td nowrap align='right'>&nbsp;"+rs.GetColumnString(i)+"&nbsp;</td>");
                  else
                    out.print("<td nowrap>&nbsp;"+ToHTML(Library.LRTrim(rs.GetColumnString(i)))+"&nbsp;</td>");
                }
                out.println("</tr>");
                rs.Next();
                numRows++;
              }

              if(!rs.Eof()){
                out.print("<tr>");
                for(int i=1;i<=numCols;i++) {
                  out.print("<td nowrap>&nbsp;...&nbsp;</td>");
                }
                out.println("</tr>");
                out.print("<tr>");
                out.print("<td align='right' colspan='"+numCols+"'>&nbsp;<a href='javascript:window.opener.ExecuteSQL(true);'>Show all</a>&nbsp;</td>");
                out.println("</tr>");
              }
              out.println("</table>");
            }
            rs.Close();
            out.println("<div style='font-size:8.5pt;'> Execution time: <span id='executiontime'>"+executiontime+"</span> ms</div>");
            out.println("</body>");
            out.println("</html>");
          } else {
		  //System.out.println("errore:"+vqrHolder.Error() +" -- "+vqrHolder.GetPlan(status.context));
            out.print( vqrHolder.GetPlan(status.context));/*
			sqlPhrase = SPLib.ToHTMLRepresentation(SPLib.ToHTML(sqlPhrase,"C",0,0));
			sqlPhrase = Library.Strtran(sqlPhrase, "  ", "&nbsp;&nbsp;");
			sqlPhrase = Library.Strtran(sqlPhrase, " |", "&nbsp;|");
			sqlPhrase = Library.Strtran(sqlPhrase, "color:red", "&nbsp;&nbsp;&nbsp;<div style='color:red;background-color:red;width:8px;height:9px;display:inline-block;'></div>");
            sqlPhrase = Library.Strtran(sqlPhrase, "color:yellow", "&nbsp;&nbsp;&nbsp;<div style='color:yellow;background-color:yellow;width:8px;height:9px;display:inline-block;'></div>");
            sqlPhrase = Library.Strtran(sqlPhrase, "color:green", "&nbsp;&nbsp;&nbsp;<div style='color:green;background-color:green;width:8px;height:9px;display:inline-block;'></div>");
            sqlPhrase = Library.Strtran(sqlPhrase, "color:blue", "&nbsp;&nbsp;&nbsp;<div style='color:blue;background-color:blue;width:8px;height:9px;display:inline-block;'></div>");
            sqlPhrase = Library.Strtran(sqlPhrase, "color:none", "&nbsp;&nbsp;&nbsp;<div style='display: inline-block; color: black; border: 2px solid; height: 5px; width: 4px;'></div> Operazione non riconosciuta");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>SQL Phrase</title>");
            out.println("<style>");
            out.println(".KeyWord {font-weight:bold;color:blue}");
            out.println("</style>");
            out.println("</head>");
            out.println("<body style='font-family:verdana;font-size:10pt;background-color:#D6D6CE'>");
            out.println(sqlPhrase);
            out.println("</body>");
            out.println("</html>");*/
          }
        }
      }
    }
  }

  private String obfuscateIfNeeded(String str) {
    if ( CPSecureDBConfig.guessIsObfuscated(str) ) {
      return str;
    }
    return CPSecureDBConfig.obfuscate(str);
  }

  private String remoteParametersRequest (HttpServletRequest request) throws UnsupportedEncodingException {
    String newRequestParms =
     "m_cAction="   + URLEncoder.encode(SPLib.GetParameter(request,"action",         "") , "UTF-8") + "&" +
     "m_cUsername=" + URLEncoder.encode(obfuscateIfNeeded(
                                        SPLib.GetParameter(request,"remote_user",    "")), "UTF-8") + "&" +
     "m_cPassword=" + URLEncoder.encode(obfuscateIfNeeded(
                                        SPLib.GetParameter(request,"remote_password","")), "UTF-8") + "&" +
     "m_cCompany="  + URLEncoder.encode(SPLib.GetParameter(request,"remote_company", "") , "UTF-8") + "&" +
     "m_cInstance=" + URLEncoder.encode(SPLib.GetParameter(request,"remote_instance","") , "UTF-8");

    List privilegedParms = Arrays.asList(
      "remote_server"  ,
      "remote_user"    , "m_cUsername",
      "remote_password", "m_cPassword",
      "remote_company" , "m_cCompany" ,
      "remote_instance", "m_cInstance",
      "action"         , "m_cAction"
    );

    for (Enumeration e = request.getParameterNames(); e.hasMoreElements() ;) {
      String param = (String)e.nextElement();
      if ( !privilegedParms.contains(param) ) {
        newRequestParms += "&" + param + "=" + URLEncoder.encode(getParameter(request, param,""), "UTF-8");
      }
    }

    return newRequestParms;
  }

  private Properties get_m_oWv_props(SPParameterSource source) {
    return CPLib.GetProperties(source.GetParameter("m_cWv",""));
  }

  private String getRemoteProp(HttpServletRequest request, SPParameterSource source, String prop, String defaultValue) {
    String res = getParameter(request, prop, get_m_oWv_props(source).getProperty("0#"+prop));
    if ( CPLib.Empty(res) ) {
      res = defaultValue;
    }
    return res;
  }

  private void doItRemoteNative(HttpServletRequest request, SPParameterSource source, HttpServletResponse response) throws IOException {
    PrintWriter out = response.getWriter();
    try {
      //Ispirato da http://www.docjar.com/html/api/com/sun/xml/internal/ws/transport/http/client/HttpClientTransport.java.html
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      byte[] bodyReq = remoteParametersRequest(request).getBytes("UTF-8");
      baos.write(bodyReq, 0, bodyReq.length);
      //String remote_server = getRemoteProp(request, source, "remote_server", "EMPTY_REMOTE_SERVER");
      //if ( !remote_server.startsWith("http://") || !remote_server.startsWith("https://") ) {
        //remote_server = "http://"+remote_server;
      //}
      HttpURLConnection connection = (HttpURLConnection) new URL(getRemoteProp(request, source, "remote_server", "EMPTY_REMOTE_SERVER")+"/servlet/SPVQRProxy").openConnection();
      connection.setUseCaches(false);
      connection.setDoOutput(true);
      connection.setDoInput(true);
      //la GET (con gli eventuali password/utente-hash sicurezza) puo' finire nelle cache dei proxy HTTP,
      //lo evito usando il metodo POST
      connection.setRequestMethod("POST");
      //non voglio bloccare indefinitamente la lettura dei dati remoti
      connection.setReadTimeout(m_iRemoteRequestTimeout);
      connection.setRequestProperty("Content-Length", ""+baos.size());
      connection.setRequestProperty("Content-Type", WEB_SERVICE_CLIENT_CONTENT_TYPE+"; charset=UTF-8");
      connection.setRequestProperty(WEB_SERVICE_CLIENT_CONTENT_HEADER, WEB_SERVICE_CLIENT_CONTENT_HEADER_VALUE);
      OutputStream outputStream = connection.getOutputStream();
      baos.writeTo(outputStream);
      outputStream.flush();
      outputStream.close();
      connection.connect();
      InputStreamReader isr = new InputStreamReader(connection.getInputStream(),"UTF-8");
      //InputStream is = url.openStream();
      int b;
      while ( (b = isr.read()) != -1 ) {
        out.write(b);
      }
      isr.close();
    } catch(OutOfMemoryError oome) {
      throw oome;
    } catch(MalformedURLException mue) { //url formalmente non corretto
      out.print("['Unexpected error:','    Malformed server url.']");
    } catch(UnknownHostException uhe) { //host sconosciuto
      out.print("['Unexpected error:','    Unreacheable server.']");
    } catch(ConnectException uhe) { //host ok, porta sbagliata
      out.print("['Unexpected error:','    Unable to connect to server.']");
    } catch(FileNotFoundException fnfe) { //servlet/SPVQRProxy non trovato
      out.print("['Unexpected error:','    Remote query service not found.']");
    } catch(ClassCastException cce) { //protocollo noto ma non applicabile a HttpURLConnection
      out.print("['Unexpected error:','    Unsupported protocol: http or https expected.']");
    } catch(SSLHandshakeException sslhe) { // errore con https
      out.print("['Unexpected error:','    "+sslhe.getLocalizedMessage()+".']");
    } catch (Throwable t) {
      CPStdCounter.Error(t);
      out.print("['Unexpected error: "+t+"','    Error details reported to standard counters.']");
    }
  }

  private class HttpError {

    private int statusCode;
    private String message;

    public HttpError store(int statusCode, String message) {
      this.statusCode = statusCode;
      this.message = Library.Empty(message) ? "" : message;

      return this;
    }

    public boolean isEmpty() {
      return this.statusCode==0 && this.message==null;
    }

    public HttpError clear() {

      this.statusCode = 0;
      this.message = null;

      return this;
    }

    public HttpError setHttpResponseError(HttpServletResponse response) throws IOException {
      response.sendError(this.statusCode, this.message);
      return this;
    }

    public String getMessage() {
      return this.message;
    }

    public int getStatusCode() {
      return this.statusCode;
    }

  }

  public boolean fromRemote(HttpServletRequest request) {
    return request.getHeader(WEB_SERVICE_CLIENT_CONTENT_HEADER)!=null;
  }

  public boolean toRemote(HttpServletRequest request, SPParameterSource source) {
    return request.getParameter("remote_server")!=null ||
           !CPLib.Empty(CPLib.GetProperties(source.GetParameter("m_cWv","")).getProperty("0#remote_server"));
  }

  String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if ( value == null ) {
      return defaultValue;
    } else {
      return SPLib.ParameterValue(value,defaultValue);
    }
  }

  private HttpError httpError;

  private HttpError getHttpError() {
    if ( httpError==null ) {
      httpError = new HttpError();
    }
    return httpError;
  }

  private boolean canAccessEditor(ServletStatus status, HttpServletRequest request, HttpServletResponse response) {
    if ( !fromRemote(request) ) {
      return SPLib.CanAccessEditor(status.context,"PortalStudio");
    }

    if ( Library.Empty(getParameter(request, "m_cAction", "")) ) {
      getHttpError().store(HttpServletResponse.SC_BAD_REQUEST, "Parameter m_cAction is mandatory.");
      return false;
    }

    if ( !"vqr".equals(getParameter(request, "m_cAction", "")) ) {
      getHttpError().store(HttpServletResponse.SC_FORBIDDEN, "Action "+getParameter(request, "m_cAction", "")+" not allowed.");
      return false;
    }

    if ( !"UTF-8".equalsIgnoreCase(request.getCharacterEncoding()) ) {
      Library.error(
        new Error(getHttpError()
          .store(HttpServletResponse.SC_PRECONDITION_FAILED, "Request encoding should be UTF-8, it's "+request.getCharacterEncoding()+" instead")
          .getMessage()
        )
      );
      return false;
    }

    SPLib.NoCache(response);
    //l'XML in arrivo da e' sempre condificato con UTF-8, devo poter interpretare correttamente
    //l'input qualsiasi sia la codifica configurata dell'applicazione, NON bisogna usare poi SPLib.GetParameter
    //che potrebbe impostare l'encoding di applicazione su request
    double l_nUser = 0;

    String l_cAction   = getParameter(request, "m_cAction", ""),
           l_cUsername = CPSecureDBConfig.deobfuscate(getParameter(request, "m_cUsername", "")),
           l_cPwd      = CPSecureDBConfig.deobfuscate(getParameter(request, "m_cPassword", "")),
           l_cCompany  = getParameter(request, "m_cCompany", ""),
           l_cInstance = getParameter(request, "m_cInstance", "");

    CPContext c = null;
    CPSecurity.ValidationHooks h = null;

    try {
      String errorMessage = "";
      try {
        h = CPLib.EntryPoint(l_nUser, l_cUsername, l_cPwd, l_cCompany, l_cInstance);
      } catch(Forward module_logout) {

      }
      if (h==null || h.m_nValidationCode != CPLib.VALIDATED) {
        h = null;
        getHttpError().store(HttpServletResponse.SC_UNAUTHORIZED, "Wrong credentials");
      } else if (h != null &&
                 h.m_nValidationCode == CPLib.VALIDATED &&
                 !h.GetContext().CanAccess(getClass().getName())) {
        h = null;
        getHttpError().store(HttpServletResponse.SC_UNAUTHORIZED, "Access denied");
      }
      if (h==null) {
        return false;
      } else {
        c = h.GetContext();
      }
      if (!CPLib.IsAdministrator(c) &&
          c.HasAdministeredUsers() &&
          !CPLib.Empty(CPLib.MustAdmin(c,new SPXDCReaderFactory(status.context.GetInstance()),Library.GetClassesPath()))) {
        getHttpError().store(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "The database of this application must be administered.");
        return false;
      }
      if (!c.GetAuthority().IsSecured(getClass().getName(),null)) {
        getHttpError().store(HttpServletResponse.SC_UNAUTHORIZED,
                             getClass().getName()
                             +" is not explicitly administered for this application, enable access adding procedure rights for "
                             +getClass().getName()+"."
                            );
        return false;
      }
    } finally {
      if ( h != null && c != null ) {
        //login diretta da programma client http
        CPLib.ExitPoint(c);
        return true;
      }
      return false;
    }
    //return false;
  }

  protected String ToHTML(String s) {
    s=Library.Strtran(s,"&","&amp;");
    s=Library.Strtran(s,"\\","&#092;");
    s=Library.Strtran(s,"<","&lt;");
    s=Library.Strtran(s,">","&gt;");
    s=Library.Strtran(s,"\"","&quot;");
    s=Library.Strtran(s,"'","&#39;");
    s=Library.Strtran(s,"\u20ac","&euro;");
    return s;
  }

  private ArrayList<Properties> getAllParameters(String pFilename) throws Exception{ 
    //restituisce tutte i parameteri compresi quelli presenti nelle subquery e nelle tabelle temporanee
    ArrayList<Properties> p=new ArrayList<Properties>();
    ArrayList<Properties> pSubQuery=new ArrayList<Properties>();
    if(!Library.Empty(pFilename)) {
      VQRReader vqrReader = new VQRReaderDirect(pFilename, new SPVQRReaderFactory());
      ByteArrayOutputStream b;
      Properties tables,wheres,union;
      tables=vqrReader.ExtractTables();
      vqrReader.ExtractFields();
      vqrReader.ExtractRelations();
      wheres=vqrReader.ExtractWheres();
      vqrReader.ExtractOrderBy();
      vqrReader.ExtractGroupBy();
      vqrReader.ExtractDistinct();
      p.add(vqrReader.ExtractParam());
      vqrReader.ExtractExtMask();
      vqrReader.ExtractRemoveFilterOnEmptyParam();
      union=vqrReader.ExtractUnion();
      vqrReader.EndExtraction();
      // cerco i parametri delle union
      String name=CPLib.GetProperty(union,"union","",0);
      if (!"".equals(name)){
        try{
          pSubQuery=getAllParameters(name);
          p.addAll(pSubQuery);
        }
        catch (Exception e){}
      }
      // cerco i parametri delle subquery
      int rows=Integer.parseInt((wheres.getProperty("0#Rows")));
      for (int i=0; i<rows; i++){
        name=CPLib.GetProperty(wheres,"const","",i);
        if (!"".equals(name) && name.charAt(0)!='?'){
          try{
            pSubQuery=getAllParameters(name);
            p.addAll(pSubQuery);
          }catch (Exception e){}
        }
      } 
      //cerco i parametri delle tabelle temporanee create da query con parametri
      rows=Integer.parseInt((tables.getProperty("0#Rows")));
      for (int i=0; i<rows; i++){
        name=CPLib.GetProperty(tables,"desc","",i);
        if ((name.toLowerCase()).endsWith(".vqr")){
          try{
            pSubQuery=getAllParameters(name.substring(0,name.length()-4));
            p.addAll(pSubQuery);
          }
          catch (Exception e){}
        }
      } 
    }
    return p;
  }
  
  
  
  class MyCaller implements Caller { //extends CallerImpl {
    Hashtable<String,Object> vars;

    MyCaller() {
      vars = new Hashtable<String,Object>();
    }

    public void SetString(String p_cVarName,String p_cType,int len,int dec,String value) {
      vars.put(p_cVarName, value);
    }
    public String GetString(String p_cVarName,String p_cType,int len,int dec) {
      String res = (String)vars.get(p_cVarName);
      if (res==null)
        return "";
      return res;
    }
    public void SetNumber(String p_cVarName,String p_cType,int len,int dec,double value) {
      vars.put(p_cVarName, String.valueOf(value));
    }
    public double GetNumber(String p_cVarName,String p_cType,int len,int dec) {
      String res = (String)vars.get(p_cVarName);
      if (res==null)
        return 0;
      return Double.parseDouble(res);
    }
    public void SetLogic(String p_cVarName,String p_cType,int len,int dec,boolean value) {
      vars.put(p_cVarName, String.valueOf(value));
    }
    public boolean GetLogic(String p_cVarName,String p_cType,int len,int dec) {
      String res = (String)vars.get(p_cVarName);
      if (res==null)
        return false;
      return Boolean.valueOf(res).booleanValue();
    }
    public void SetDate(String p_cVarName,String p_cType,int len,int dec,java.sql.Date value) {
      vars.put(p_cVarName, value);
    }
    public java.sql.Date GetDate(String p_cVarName,String p_cType,int len,int dec) {
      java.sql.Date res = (java.sql.Date)vars.get(p_cVarName);
      if (res==null)
        return CPLib.NullDate();
      return res;
    }
    public void SetDateTime(String p_cVarName,String p_cType,int len,int dec,java.sql.Timestamp value) {
      vars.put(p_cVarName, value);
    }
    public java.sql.Timestamp GetDateTime(String p_cVarName,String p_cType,int len,int dec) {
      java.sql.Timestamp res = (java.sql.Timestamp)vars.get(p_cVarName);
      if (res==null)
        return CPLib.NullDateTime();
      return res;
    }
    public void CalledBatchEnd() {}

    public String toString(){
      return vars.toString();
    }
  }
}
