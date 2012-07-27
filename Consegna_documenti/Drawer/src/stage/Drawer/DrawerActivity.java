package stage.Drawer;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;

public class DrawerActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/example.html");  
        
        //super.loadUrl("http://padova.zucchetti.it/Accademia/Giacomo_App/test3/example.html");
        
    }
}