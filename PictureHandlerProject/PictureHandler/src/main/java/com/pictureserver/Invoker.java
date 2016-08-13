package com.pictureserver;

import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@WebServlet("/Invoker")
public class Invoker extends HttpServlet {

	
	private static final long serialVersionUID = 1L;
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub

		response.addHeader("Access-Control-Allow-Origin", "http://localhost:8000");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		response.addHeader("Access-Control-Allow-Methods", "GET, POST");
		response.addHeader("Access-Control-Allow-Headers ", "Content-Type, *");
		response.setContentType("application/json");
		    
		String cmmnd = request.getParameter("cmd");

		if (cmmnd == null)
			return;
		
		if (cmmnd.equals("funcs"))
		{
			sendFuncsList(request, response);
		}

		if (cmmnd.equals("flows"))
		{
			sendFlowsList(request, response);
		}
		
	}

	/**
	 * send func list to client
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	public void sendFuncsList(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		Global.mainLogger.info(String.format("Send funcs list to ip: %s", request.getRemoteAddr()));

		File srcFile = new File(Global.jsonFunctionPath);
		FileUtils.copyFile(srcFile, response.getOutputStream());
	}

	/**
	 * Send flow list to client
	 * @param request 
	 * @param response
	 * @throws IOException
	 */
	public void sendFlowsList(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		try {
			Global.mainLogger.info(String.format("Send flow list to ip: %s", request.getRemoteAddr()));
			JSONArray jsArray =  Preview.sqlFlowListJson();;
				
			PrintWriter printWriter  = response.getWriter();
			printWriter.println(jsArray.toString());
			
		} catch (SQLException e) {

			Global.mainLogger.severe("SQL: problem to send flows list");
			e.printStackTrace();
		} catch (JSONException e) {
			Global.mainLogger.severe("JSON: problem to send flows list");
			e.printStackTrace();
		}
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{
		
        HttpSession session = request.getSession();
		Global.mainLogger.info("Get invoker command from session:" + session.getId());

		response.addHeader("Access-Control-Allow-Origin", "http://localhost:8000");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		response.addHeader("Access-Control-Allow-Methods", "GET, POST");
		response.addHeader("Access-Control-Allow-Headers ", "Content-Type, *");
		BufferedReader read = request.getReader();
		
		String line = read.readLine();
		String sessionId = session.getId();

		java.io.PrintWriter out = response.getWriter( );
		Version ver;
		if ((ver = HandleInvoke(line, sessionId)) == null)
		{
			Global.respond(out, Global.invokerProblem, Global.invokerProblemDesc);
		}
		else
		{
				JSONObject js = ver.all;
				try {
					
					//make array of changes image
					JSONArray previewImages = new JSONArray();
					for (int i = ver.derivedFromIndex.get() + 1; i <= ver.currentIndex.get(); i ++)
							previewImages.put(i);
				
					js.put("previewImages", previewImages);
					js.put("history", ver.gTempInvokesCommendArray);

					//System.out.println(js.toString(4));
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				System.out.println(js);
				out.println(js);
		}
	
	}

/**
 * Invokes cmmnd handle	
 * @param line
 * @param sessionId
 * @return
 */
	public static Version HandleInvoke(String line, String sessionId) {
		try {
		
			JSONObject Json = new JSONObject(line);

			String typeStr 			= Json.get("type").toString();
		
			/*
			 * Edit mode:
			 * 	when triggered, remove all history of specific session.
			 */
			if (typeStr.equals("edit"))
			{
						
				JSONArray images = ((JSONArray) Json.get("images"));
				String baseImg	= images.get(0).toString();
				
				String id	=  Json.getString("id");	//index of current photo. usefull for backtracking changes
				
				
				if (images.length() == 0)
					return Global.InvokerPreviewBook.getVersion(sessionId);
			
				Version ver = Preview.startEditMode(baseImg, sessionId);
				
				Global.mainLogger.info("Initiate edit mode for session: " + sessionId +" , with picture: " + baseImg);
				if (id.length() > 0)
				{
					Preview.loadFromId(null, null, null, ver, id, images, sessionId);
				}
				
				
				return ver;
			} 
		
				
			//preview mode, batch
			
			JSONArray images 	= (JSONArray) Json.get("images");		//get image array
			Global.mainLogger.info("Invoker cmmnd: \n"
					+ " Type:    " + typeStr + "\n"
					);		
				
					
			/*
			 * preview mode:
			 * 			
			 */
			if (typeStr.equals("preview"))
			{
				
				JSONObject invokeCmmnd	= (JSONObject) Json.get("invoke");	//get invokes cmmnds
				int currentIndex	=  Json.getInt("index");	//index of current photo. usefull for backtracking changes
				Global.mainLogger.info("Initiate preview mode for session: " + sessionId +" , with pictures: " + images + " , with index" + currentIndex );
				Version versionOfCurrentSession = Global.InvokerPreviewBook.getVersion(sessionId);
				

				Preview.handleIndexes(versionOfCurrentSession, currentIndex, sessionId);
				versionOfCurrentSession.gTempInvokesCommendArray.put(invokeCmmnd);
				String[] iiifAndPath = (previewInvoke(null, invokeCmmnd, images, sessionId, null));
				versionOfCurrentSession.createPageToTemp(iiifAndPath);
				
			} 
			
			if (typeStr.equals("save"))
			{
				
				int currentIndex	=  Json.getInt("index");	//index of current photo. usefull for backtracking changes
				String idToSave		=  Json.getString("id");	//id of current flow. usefull for backtracking changes
				boolean overwrite	=  Json.getBoolean("overwrite");
				
				
				Global.mainLogger.info("Initiate save mode for session: " + sessionId +"\nName: " + idToSave + "\nindex " + currentIndex  +"\noverwrite " + overwrite);
				
				Version versionOfCurrentSession = Global.InvokerPreviewBook.getVersion(sessionId);
				
				Preview.saveSession(versionOfCurrentSession, idToSave, currentIndex, overwrite, sessionId);

				
			} 
				
			
			
			
		} catch (Exception e) {
			return null;
		}
		return Global.InvokerPreviewBook.getVersion(sessionId);
	}

	
	
	
	/*
	 * 
	 * Images array in the format "BOOK/VERSION/PAGE.jpg" NOTICE: WITHOUT SLASH IN THE BEGININNG
	 */
	//preview take only one image.
	//return base address of the new picture.
	public static String[] previewInvoke(Session session, JSONObject invokeCmmnd, JSONArray images, String sessionId, Basic basicRemote) throws JSONException {
		
		String image = (String) images.get(0);
		String newImagePath = null;
		String[] fields = image.split("/");
		String book 	= fields[0];
		String version 	= fields[1];
		String page 	= fields[2];
		
		String toReturnedIIIF = null; //path for mirador
		
		String oldImage = Global.filePath + Global.sep + book + Global.sep + version + Global.sep + page;
		

			int newIndex = Global.tempIndex.getAndIncrement();
			newImagePath 	=	Global.tempFolderPath + Global.sep + sessionId + Global.sep + newIndex  + ".jpg";
			toReturnedIIIF 	=   Global.tempFolderName +"/" + sessionId + "/" + newIndex + ".jpg";
			
			JSONObject singleInvoke = new JSONObject(invokeCmmnd.toString());
			singleInvoke.put("input", oldImage);
			singleInvoke.put("output", newImagePath);			
			if (!singleInvokeGateFunction(session, singleInvoke, basicRemote))
				return null;
			oldImage = newImagePath;		//chain: new->old
			

		
		String[] willReturn = {newImagePath, toReturnedIIIF};
		return willReturn;
	}

	
	public static boolean singleInvokeGateFunction(Session session, JSONObject singleInvoke, Basic basicRemote) {
		
		try {
	
			BufferedImage imgInput = ImageIO.read(new File(singleInvoke.get("input").toString()));
			BufferedImage imageOutput = new BufferedImage(imgInput.getWidth(), imgInput.getHeight(),  
				    BufferedImage.TYPE_BYTE_GRAY);  
			Graphics g = imageOutput.getGraphics();  
			g.drawImage(imgInput,0, 0, null);
			g.dispose();  
			
			File outputfile = new File(singleInvoke.get("output").toString());
			outputfile.mkdirs();
			ImageIO.write(imageOutput, "jpg", outputfile);

//			//on error:
//			if (basicRemote != null)
//			{
//				JSONObject err = new JSONObject();
//				err.put("display", "error: + blablabla");
//				err.put("currentImageIndex", "2");
//
//				session.close();
//			}
//			
			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return true;
		
	}

	
	public static void runBatchOnVersion(Session session, Basic basicRemote, String sessionId, String bookName,
			String newVersionName, String flowId, JSONArray images) {
		
	
		Book book = Global.getBook(bookName);
		Version newVersion = book.getVersion(newVersionName);
		newVersion.addToSql();
		JSONObject toPrintOnUser = new JSONObject();
		for (int i = 0; i < images.length(); i++)
		{
			try {
				String image = images.getString(i);
				
				toPrintOnUser.put("currentImageIndex", i);
				/*The idea is to make a new version per image, and get the last image
				 * And after that, insert the image to manifest page.
				 */				
				Version tempVer = Global.InvokerPreviewBook.getNewVersion(sessionId);	
				String tempPathImageAddress[] = Preview.loadFromId(session,basicRemote, toPrintOnUser, tempVer, flowId, (new JSONArray()).put(image), sessionId);
			if (tempPathImageAddress == null)
				return;
				
				newVersion.copyImageFromTempToManifest(tempPathImageAddress, toPrintOnUser.getString("imageName").split("/")[2]);
				

				
			} catch (JSONException e) {
				Global.mainLogger.severe("Coudn't extract image string from array of images");
				e.printStackTrace();
			} catch (Exception e) {
				Global.mainLogger.severe("Coudn't copy imag from temp to manifest");
				e.printStackTrace();
			}
		}
		
		JSONObject finish = new JSONObject();
		try {
			finish.put("display", "error: + blablabla");
			finish.put("currentImageIndex", -1);
			basicRemote.sendText(finish.toString());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		
	}
	

}
