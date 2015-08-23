package pictureServer;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class Preview {


	public Preview(String image, String sid) {


		
	}

	
	public static void startEditMode(String image, String sid) {
		// init edit mode, remove old preview and create new one.
		// will remove from preview table all instance of current session.
	
		Connection databaseConnection;
		try {
			
			databaseConnection = Global.getDatabaseNewConnection();
			Statement stmt = databaseConnection.createStatement();

			//delete if found another preview mode from this session
			String sqlDeleteSession = "DELETE FROM PREVIEW where session_id = \""+ sid + "\"";
			stmt.execute(sqlDeleteSession);
			
		    //add first edit mode for current session
			String addFirstSession = "INSERT INTO preview VALUES (\"" + sid + "\", \"" + image + "\", NULL, 0, NULL)";
			Global.mainLogger.info("init edit mode, sesId/baseImage: " + sid + "/" + image);
			stmt.execute(addFirstSession);

		    	
		    stmt.close();
		    databaseConnection.close();
		
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			Global.mainLogger.severe("SQL: init editor mode problem");
			e.printStackTrace();
		}
		
		
	}

}