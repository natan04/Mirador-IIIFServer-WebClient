package pictureServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{
		
		BufferedReader reader = request.getReader();
		String json = null;
		json = reader.readLine();
		Global.mainLogger.info("get post data from ip: " + request.getRemoteAddr() + "\n" +
				"data: " + json);

		try {
		
			JSONObject obj = new JSONObject(json);

		} catch (JSONException e) {
		}
		
	}

}
