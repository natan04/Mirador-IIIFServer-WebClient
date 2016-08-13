package com.pictureserver;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;

import org.json.JSONArray;
import org.json.JSONException;
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
	
	public static Version startEditMode(String image, String sid) {
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
		
		return ver;
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


	public static void saveSession(Version versionOfCurrentSession,
			String idToSave, int choseIndex, boolean overwrite, String sessionId) {

		handleIndexes(versionOfCurrentSession, choseIndex, sessionId);			//arrange chose index
		
		
		Connection databaseConnection;
		try {
			
			databaseConnection = Global.getDatabaseNewConnection();
			Statement stmt = databaseConnection.createStatement();

			//remove any appearance of it.
			if (overwrite)
			{
				//delete if found another preview mode from this session
				String sqlDeleteSession = "DELETE FROM flows where flow_id = \""+ idToSave + "\"";
				stmt.execute(sqlDeleteSession);
			}
			
		    //add flow of current session
			String flowHistory = versionOfCurrentSession.gTempInvokesCommendArray.toString();
			String addFlow = "INSERT INTO flows VALUES (\"" + idToSave + "\", '" + flowHistory + "')";

			System.out.println(addFlow);
			stmt.execute(addFlow);

		    	
		    stmt.close();
		    databaseConnection.close();
		
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			Global.mainLogger.severe("SQL:save mode problem");
			e.printStackTrace();
		}
		
	}


	
	public static JSONArray sqlSpecificFlowJson(String id) throws SQLException, JSONException
	{
		String queryFlows = "SELECT json_history FROM flows	where flow_id == \"" + id + "\"";
		Connection dc = Global.getDatabaseNewConnection();
		Statement stmt = dc.createStatement();
		ResultSet rs = stmt.executeQuery(queryFlows);  
		JSONArray js =  null;
	
		while ( rs.next() )
			 js =  new JSONArray(rs.getString("json_history"));					
		
		stmt.close();
	    dc.close();
		
		return js;
	}
	
	/**
	 * 
	 * @return JSONarray of flows and ids
	 * @throws SQLException
	 * @throws JSONException
	 */
	public static JSONArray sqlFlowListJson() throws SQLException, JSONException
	{
		String queryFlows = "SELECT * FROM flows;";
		Connection dc = Global.getDatabaseNewConnection();
		Statement stmt = dc.createStatement();
		ResultSet rs = stmt.executeQuery(queryFlows);  
		JSONArray jsArray = new JSONArray();
		while ( rs.next() )
		  {
			JSONObject obj = new JSONObject();
			obj.put("id",rs.getString("flow_id"));
			
			obj.put("invokes",new JSONArray(rs.getString("json_history")));					
			jsArray.put(obj);
		
		  }

		
		stmt.close();
	    dc.close();
		
		return jsArray;
	}


/**
 * This function loading to temp version, the image after run all the specified flow.
 * @param session 
 * @param toPrintOnUser 
 * @param basicRemote 
 * @param tempVer A temp version that belong to session
 * @param flowId	The flow we want to run on the image
 * @param images	Json array of one image
 * @param sessionId Session Id string
 * @return the last image paths(real and iiif)
 */
	public static String[] loadFromId(Session session, Basic basicRemote, JSONObject toPrintOnUser, Version tempVer, String flowId, JSONArray  images, String sessionId) {
		// TODO Auto-generated method stub
		try {
			JSONArray ar = sqlSpecificFlowJson(flowId);
			String[] iiifAndPath = null;
			String firstImage = images.getString(0);
			for (int i = 0; i < ar.length(); i++)
			{
				

				JSONObject invokeCmmnd = ar.getJSONObject(i);
				
				//printing on client
				if(toPrintOnUser != null)
				{
					toPrintOnUser.put("imageName", firstImage);
					toPrintOnUser.put("display", String.format("image: %s. %s::%s. ",firstImage, invokeCmmnd.getString("function"),invokeCmmnd.getString("class")));
					basicRemote.sendText(toPrintOnUser.toString());
				}
				iiifAndPath = (Invoker.previewInvoke(session, invokeCmmnd, images, sessionId, basicRemote));
				if (iiifAndPath == null)
					return null;
					
				tempVer.createPageToTemp(iiifAndPath);

				tempVer.currentIndex.incrementAndGet();
				tempVer.derivedFromIndex.incrementAndGet();
				//images is an array with iiif image. so we remove and add again,
				images.remove(0);
				images.put(iiifAndPath[1]);
			}
		
			tempVer.gTempInvokesCommendArray = new JSONArray(ar.toString());
			
			return iiifAndPath;
			
		} catch (SQLException e) {
			Global.mainLogger.severe("SQL: failed to invoke flow id: " + flowId);
			e.printStackTrace();
		} catch (JSONException e) {
			Global.mainLogger.severe("Json: failed to load flow id: " + flowId);
			e.printStackTrace();
		}catch (Exception e) {
			Global.mainLogger.severe("Create page to temp: failed to load flow id: " + flowId);
			e.printStackTrace();
		}
		return null;
		
	}

	
	

}