package pictureServer;


import java.io.IOException;
import java.util.logging.Logger;
 



import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.server.ServerEndpoint;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
 
@ServerEndpoint(value = "/Batcher")
public class Batcher {
 
    private Logger logger = Logger.getLogger(this.getClass().getName());
 
    @OnOpen
    public void onOpen(Session session) {
        logger.info("Connected ... " + session.getId());
    }
 
    @OnMessage
    public String onMessage(String message, Session session) {

    	try {
			JSONObject ob = new JSONObject(message);
			
			switch (ob.getString("type")){
	        
			case "batch":
				handleBatch(session,session.getBasicRemote(), session.getId(), ob.getString("book"), ob.getString("newVersion"), ob.getString("flowId"),ob.getJSONArray("images") );
				session.getBasicRemote().sendText((new JSONObject().put("display", "Success!")).toString());
				session.close();
			
			}
		} catch (JSONException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    
    	return "ok";
    }
 
    private void handleBatch(Session session, Basic basicRemote, String sessionId, String book, String version,
			String flowId, JSONArray images) {
		
    	System.out.println(String.format("book: %s, version: %s, flowId: %s, images %s", book, version, flowId, images.toString()));
    	try {
    		
			basicRemote.sendText(String.format("book: %s, version: %s, flowId: %s, images %s", book, version, flowId, images.toString()));
			Invoker.runBatchOnVersion(session, basicRemote, sessionId,book, version, flowId,  images);
			
		
    	} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	
    }

	@OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info(String.format("Session %s closed because of %s", session.getId(), closeReason));
    }
}