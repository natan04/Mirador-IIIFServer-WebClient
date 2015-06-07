package pictureServer;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Comparator;
import java.util.Scanner;

import javax.imageio.ImageIO;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class Book implements Comparable<Book>, Comparator<Book> {
	String fId = null;
	JSONArray fCanvas;
	JSONObject all;
	String getId()
	{
		return fId;
	}
	
	Book(String id, boolean restore)
	{
		fId = id;
		
		if (restore)
		{
			Global.mainLogger.info("Restoreing book: " + id);
            String pathOfJson = Global.filePath + Global.sep + fId + Global.sep + "jsonCanvas" +".json";
            File f = new File(pathOfJson);
			Scanner sc;
			try {
				sc = new Scanner(f);
				String line = sc.nextLine();
				fCanvas = new JSONArray(line);
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
		}
		else
		{
			Global.mainLogger.info("creating book: " + id);

			fCanvas = new JSONArray();
		}
		
		try {
			JSONObject sequenceElement = new JSONObject();
		//	JSONObject canvas = new JSONObject();
			sequenceElement.put("viewingDirection", "left-to-right");
			sequenceElement.put("viewingHint", "paged");
			sequenceElement.put("canvases", fCanvas);
			
			JSONArray sequences = new JSONArray();
			sequences.put(sequenceElement);
			
			all = new JSONObject();
			all.put("description", "Default description");
			all.put("sequences", sequences);
			all.put("attribution", "Default attribution");
			all.put("@type", "sc:Manifest");
			all.put("@label", "Default label");
			
			
			
			
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		
	}
	

	
	
	void addPage(File aFile)
	{
		Global.mainLogger.info("adding page: " + aFile.getName() + " in book:" + fId);

		String port = "80"; //didn't put
		String spec = "full/full/0/default.jpg";
		String idRes = Global.gNameOfServer + fId + "/" + aFile.getName() + "/full/full/0/default.jpg";
		String idSer = Global.gNameOfServer + fId + "/" + aFile.getName();
		String typeImage = "dctypes:Image";
		String typeCanvas = "sc:Canvas";
		String label = "Default label";
		JSONObject toReturn = new JSONObject();
		
	      BufferedImage img = null;
          try {
              img = ImageIO.read(new File(aFile.getPath()));
              System.out.println("height:" + img.getHeight() + " width:" + img.getWidth());

              		  JSONObject firstImage = new JSONObject() ;
						firstImage.put("width", img.getWidth());
					
		              firstImage.put("height", img.getHeight());
		              
		              	JSONObject resource = new JSONObject() ;
		              	resource.put("@id", idRes);
		              
		              		JSONObject service = new JSONObject() ;
		              		service.put("@context", Global.context);
		              		service.put("@id", idSer);
		              	
		              	resource.put("service", service);
		              	
		              firstImage.put("resource", resource);
		              
		              firstImage.put("@type", typeImage);
		              firstImage.put("format", "image/jpeg");
              
	            toReturn.append("images", firstImage);
   
	            toReturn.put("width", img.getWidth());
	            toReturn.put("height", img.getHeight());

	            toReturn.put("@type", typeCanvas);
	            toReturn.put("@type", label);
              System.out.println(toReturn.toString());
             
              synchronized (fCanvas) 
              {
            	  fCanvas.put(toReturn);  
              }
              
              String pathOfJson = Global.filePath + Global.sep + fId + Global.sep + "jsonCanvas" +".json";

            //writing out the info
              File file = new File(pathOfJson);
              file.getParentFile().mkdirs(); 		
              PrintWriter out = new PrintWriter(pathOfJson);
              out.println(fCanvas.toString());
              out.close();
          } catch (IOException | JSONException e) {
          }
	
    
	}

	
	public String toString() {
		// TODO Auto-generated method stub
		return all.toString();
	}
	
	@Override
	public int compareTo(Book o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	public int compare(Book o1, Book o2) {
		// TODO Auto-generated method stub
		return o1.getId().compareTo(o2.getId());
		}
	
	
	
}
