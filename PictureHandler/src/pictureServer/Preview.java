package pictureServer;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import org.json.JSONObject;

public class Preview {


	public Preview(String image, String sid) {


		
	}

	
	public static void removeFromVersion(Version v, int index, String sid)
	{
		if (index == v.currentIndex.get())
			return;
		
		synchronized (v) {
			
			Global.mainLogger.info("Backtracking to index:" + index + ", on session:" + sid);
			for (int i = index; i < v.fCanvas.length(); i++)
			{
				v.fCanvas.remove(i);
				v.gTempInvokesCommendArray.remove(i);
			}
			
			 v.currentIndex.set(index);
			 
		}
		
		return;
		
	}
	
	public static void startEditMode(String image, String sid) {
		// init edit mode, remove old preview and create new one.
		// will remove from preview table all instance of current session.

		
		 Global.InvokerPreviewBook.getNewVersion(sid); //destroying the former version and create a new one.

		
		//	
//		Connection databaseConnection;
//		try {
//			
//			databaseConnection = Global.getDatabaseNewConnection();
//			Statement stmt = databaseConnection.createStatement();
//
//			//delete if found another preview mode from this session
//			String sqlDeleteSession = "DELETE FROM PREVIEW where session_id = \""+ sid + "\"";
//			stmt.execute(sqlDeleteSession);
//			
//		    //add first edit mode for current session
//			String addFirstSession = "INSERT INTO preview VALUES (\"" + sid + "\", \"" + image + "\", NULL, 0, NULL)";
//			Global.mainLogger.info("init edit mode, sesId/baseImage: " + sid + "/" + image);
//			stmt.execute(addFirstSession);
//
//		    	
//		    stmt.close();
//		    databaseConnection.close();
//		
//		} catch (SQLException e) {
//			// TODO Auto-generated catch block
//			Global.mainLogger.severe("SQL: init editor mode problem");
//			e.printStackTrace();
//		}
		
		
	}

}