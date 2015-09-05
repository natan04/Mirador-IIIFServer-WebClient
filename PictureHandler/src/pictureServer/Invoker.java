package pictureServer;

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

import org.apache.commons.io.FileUtils;
import org.apache.juli.logging.Log;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@WebServlet("/Invoker")
public class Invoker extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub

		response.addHeader("Access-Control-Allow-Origin", "http://localhost:8000");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		response.addHeader("Access-Control-Allow-Methods", "GET, POST");
		response.addHeader("Access-Control-Allow-Headers ", "Content-Type, *");
		response.setContentType("application/json");
		    
		String cmmnd = request.getParameter("cmd");

		if (cmmnd.equals("funcs"))
		{
			Global.mainLogger.info(String.format("Send funcs list to ip: %s", request.getRemoteAddr()));

			File srcFile = new File(Global.jsonFunctionPath);
			FileUtils.copyFile(srcFile, response.getOutputStream());
		}

		if (cmmnd.equals("flows"))
		{
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
		
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{
		
        HttpSession session = request.getSession();
		Global.mainLogger.info("Get invoker command from session:" + session.getId());

		PrintWriter printWriter  = response.getWriter();

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

					System.out.println(js.toString(4));
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				out.println(js);
		}
	
	}

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
					Preview.loadFromId(ver, id, images, sessionId);
				}
				
				
				return ver;
			} 
		
				
			//preview mode, batch
			
			JSONArray images 	= (JSONArray) Json.get("images");		//get image array
			JSONObject invokeCmmnd	= (JSONObject) Json.get("invoke");	//get invokes cmmnds
			Global.mainLogger.info("Invoker cmmnd: \n"
					+ " Type:    " + typeStr + "\n"
					+ " invoke:  " + invokeCmmnd.toString() + " \n"
					+ " images:  " + images.toString());;
		
				
					
			/*
			 * preview mode:
			 * 			
			 */
			if (typeStr.equals("preview"))
			{
				
				int currentIndex	=  Json.getInt("index");	//index of current photo. usefull for backtracking changes
				Global.mainLogger.info("Initiate preview mode for session: " + sessionId +" , with pictures: " + images + " , with index" + currentIndex );
				Version versionOfCurrentSession = Global.InvokerPreviewBook.getVersion(sessionId);
				

				Preview.handleIndexes(versionOfCurrentSession, currentIndex, sessionId);
				versionOfCurrentSession.gTempInvokesCommendArray.put(invokeCmmnd);
				String[] iiifAndPath = (previewInvoke(invokeCmmnd, images, sessionId));
				versionOfCurrentSession.createPageToTemp(iiifAndPath);
				
			} 
			
			if (typeStr.equals("save"))
			{
				
				int currentIndex	=  Json.getInt("index");	//index of current photo. usefull for backtracking changes
				String idToSave		=  Json.getString("id");	//id of current flow. usefull for backtracking changes
				boolean overwrite	=  Json.getBoolean("overwrite");
				
				
				Global.mainLogger.info("Initiate save mode for session: " + sessionId +"\nName: " + idToSave + "\nindex" + currentIndex  +"\noverwrite" + overwrite);
				
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
	public static String[] previewInvoke(JSONObject invokeCmmnd, JSONArray images, String sessionId) throws JSONException {
		
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
			singleInvokeGateFunction(singleInvoke);
			oldImage = newImagePath;		//chain: new->old
			

		
		String[] willReturn = {newImagePath, toReturnedIIIF};
		return willReturn;
	}

	
	private static void singleInvokeGateFunction(JSONObject singleInvoke) {
		
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

			return ;
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
	}
	

}
