package pictureServer;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import org.json.JSONObject;

public class Preview {


	public Preview(String image, String sid) {


		
	}

	
	//remove from version. exceptTo: not remove spacified index.
	public static void removeFromVersion(Version v, int index, int exceptTo,  String sid)
	{
		if (index == v.currentIndex.get())
			return;
		
			
			for (int i = v.fCanvas.length() - 1; i >= index; i--)
			{
				if (i == exceptTo - 1)
					continue;
			
			v.fCanvas.remove(i);
				v.gTempInvokesCommendArray.remove(i - 1);
			}
			
			 v.currentIndex.set(index);
			 
		
		
		return;
		
	}
	
	public static void startEditMode(String image, String sid) {
		// init edit mode, remove old preview and create new one.
		// will remove from preview table all instance of current session.

		
		String[] fields = image.split("/");
		String book 	= fields[0];
		String version 	= fields[1];
		String page 	= fields[2];
		
		String[] path =  { Global.filePath + Global.sep + book+ Global.sep + version + Global.sep  +page , image};
		Version ver = Global.InvokerPreviewBook.getNewVersion(sid); //destroying the former version and create a new one.
	
		try {
			ver.createPageToTemp(path);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			Global.mainLogger.severe("Problem to initate edit");
		
		}
		
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


	public static void handleIndexes(Version versionOfCurrentSession,
			int currentIndex, String sessionId) {

		Global.mainLogger.info("Derived index: " + versionOfCurrentSession.derivedFromIndex.get() + ", current index: " + currentIndex);
		synchronized (versionOfCurrentSession) {

		if (versionOfCurrentSession.derivedFromIndex.get() > currentIndex)
		{

			//we here if the index is lower from known derived index
			removeFromVersion(versionOfCurrentSession, currentIndex, -1, sessionId);
			versionOfCurrentSession.derivedFromIndex.set(currentIndex);

			Global.mainLogger.info("Decreasing value of derived index to: " + currentIndex);
		}
		if (versionOfCurrentSession.derivedFromIndex.get() < currentIndex)
		{
			Preview.removeFromVersion(versionOfCurrentSession, versionOfCurrentSession.derivedFromIndex.get() , currentIndex, sessionId);
			versionOfCurrentSession.derivedFromIndex.incrementAndGet();
			versionOfCurrentSession.currentIndex.set(versionOfCurrentSession.derivedFromIndex.get());
			Global.mainLogger.info("increasing value of derived index to: " + currentIndex);
		}
	}
	}

}