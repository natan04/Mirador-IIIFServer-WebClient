package pictureServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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

		Version versionOfCurrentSession = Global.InvokerPreviewBook.getVersion("11111");

		versionOfCurrentSession.createPageToTemp(pathToNewFile);
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
		String sessionId = session.getId();
		try {
		
			JSONObject Json = new JSONObject(read.readLine());

			String typeStr 			= Json.get("type").toString();
		
			if (typeStr.equals("edit"))
			{
				Global.mainLogger.info("Initiate edit mode for session: " + sessionId);
						
				String baseImg	= Json.get("baseImage").toString();
				Preview.startEditMode(baseImg, sessionId);
				
				return;
			} 
		
			
			JSONArray images 	= (JSONArray) Json.get("images");
			JSONObject invokeCmmnd	= (JSONObject) Json.get("invokes");
			Global.mainLogger.info("Invoker cmmnd: \n"
					+ " Type:    " + typeStr + "\n"
					+ " invoke:  " + invokeCmmnd.toString() + " \n"
					+ " images:  " + images.toString());;
		
				
			if (typeStr.equals("preview"))
			{
				String pathToNewFile = (previewInvoke(invokeCmmnd, images));
				Version versionOfCurrentSession = Global.InvokerPreviewBook.getVersion(sessionId);
				versionOfCurrentSession.createPageToTemp(pathToNewFile);
			
			} 
					
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

	
	
	
	/*
	 * 
	 * TODO:
	 * add version id to to invoke and check the result of both iiif and real path of image.
	 * 
	 */
	//preview take only one image.
	//return base address of the new picture.
	private String previewInvoke(JSONObject invokeCmmnd, JSONArray images) throws JSONException {
		
		String image = (String) images.get(0);
		String newImagePath = null;
		String[] fields = image.split("/");
		String book 	= fields[0];
		String version 	= fields[1];
		String page 	= fields[2];
		
		String toReturnedIIIF = null; //path for mirador
		
		String oldImage = Global.filePath + Global.sep + book + Global.sep + version + Global.sep + page;
		
		for (int i = 0; i < invokeCmmnd.length(); i++)
		{
			int newIndex = Global.tempIndex.getAndIncrement();
			newImagePath = Global.tempPath + Global.sep + version + Global.sep + newIndex  + ".jpg";
			toReturnedIIIF =  Global.filePath + Global.tempBookStr +"/" + version + "/" + newIndex + ".jpg";
			
			JSONObject singleInvoke = (JSONObject) (invokeCmmnd.getJSONObject("" + i));
			singleInvoke.put("input", oldImage);
			singleInvoke.put("output", newImagePath);			
			singleInvoke(singleInvoke);
			oldImage = newImagePath;		//chain: new->old
			
		}
		
		String[] willReturn = {newImagePath, toReturnedIIIF};
		return willReturn;
	}

	private void singleInvoke(JSONObject singleInvoke) {
		
		//System.out.println(singleInvoke.toString());
	}

}
