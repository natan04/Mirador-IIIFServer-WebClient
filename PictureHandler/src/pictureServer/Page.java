package pictureServer;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.Comparator;
import java.util.Scanner;

import javax.imageio.ImageIO;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Page implements Comparable<Page>, Comparator<Page>{
	public String pathOfJson;
	public String pathOfFile;
	public JSONObject json;
	public String nameOfBook;
	public String PageName;
	
	Page(String fileName, String bookID)
	{
		PageName = fileName;
		nameOfBook = bookID;
	}
	
	Page(String fileName, String bookID, String jsonPath)
	{
		
		PageName = nameFromPath(jsonPath.substring(0, jsonPath.lastIndexOf(".")));
		nameOfBook = bookID;
		pathOfFile = Global.filePath + Global.sep + nameOfBook + Global.sep + PageName;
		pathOfJson = jsonPath;
		File f = new File(jsonPath);
		if (f.exists())
		{

			try {
				Scanner sc = new Scanner(f);
				String line = sc.nextLine();
				sc.close();
				Global.mainLogger.info("restoring page: " + PageName + ", in book: " + bookID);
				
				json = new JSONObject(line);
			}
		   catch (IOException | JSONException e) {
			   
			   Global.mainLogger.severe("Couldn't restore page: " + PageName + ", On book:" + nameOfBook);
          }

		}
	}


	@Override
	public int compare(Page arg0, Page arg1) {
		return arg0.PageName.compareTo(arg1.PageName);
	}

	@Override
	public int compareTo(Page arg0) {
		return this.PageName.compareTo(arg0.PageName);
	}

	public void writePage(FileItem fileUpdate, String fileName) {

		try {
			
			File p = new File(Global.filePath + Global.sep + nameOfBook + Global.sep + fileName);
			p.getParentFile().mkdirs();
			fileUpdate.write(p);
			Global.mainLogger.info("saving page: " + fileName + "\tto book: " + nameOfBook);

			
			createJsonInFolder(p, fileName);
			pathOfFile = p.getAbsolutePath();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
      
		
	}

	private void createJsonInFolder(File p, String fileName) {
		Global.mainLogger.info("adding page: " + fileName + " in book:" + nameOfBook);

		String spec = "full/full/0/default.jpg";
		String idRes = Global.ImageServerAddress + nameOfBook + "/" + fileName + "/full/full/0/default.jpg";
		String idSer = Global.ImageServerAddress + nameOfBook + "/" + fileName;
		String typeImage = "dctypes:Image";
		String typeCanvas = "sc:Canvas";
		String label = "Default label";
		
	      BufferedImage img = null;
          try {
              img = ImageIO.read(new File(p.getPath()));
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
              
	        json = new JSONObject();
            json.append("images", firstImage);
  
            json.put("width", img.getWidth());
            json.put("height", img.getHeight());

            json.put("@type", typeCanvas);
	        json.put("@type", label);
             
   
              
              pathOfJson = Global.filePath + Global.sep + nameOfBook + Global.sep + "JsonFolder" + Global.sep +  fileName + ".json";

            //writing out the info
              File file = new File(pathOfJson);
              file.getParentFile().mkdirs(); 		
              PrintWriter out = new PrintWriter(pathOfJson);
              out.println(json);
              out.close();
          } catch (IOException | JSONException e) {
          }
		
	}

	public boolean remove() {
		
		
		File jsonF = new File(pathOfJson);
		File imageF = new File(pathOfFile);
		json = null;
	
		boolean err = true;
		err = jsonF.delete() && imageF.delete();
		if (err)
			Global.mainLogger.info("Remove Json:" + pathOfJson + "\t remove page:" + pathOfFile);
		else
			Global.mainLogger.severe("problem to remove Json:" + pathOfJson + "\t and remove page:" + pathOfFile + "Database may currpoted");
		
		return err;
	}


private String nameFromPath(String path)
{
    if( path.lastIndexOf("\\") >= 0 )
    {
    	return path.substring(path.lastIndexOf("\\") + 1);
    }
    else if(path.lastIndexOf("/") >= 0)
    	{
    		return path.substring(path.lastIndexOf("/")+1) ;
    	}
    else
    {
    	return path;
    }
}
}
