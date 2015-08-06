package pictureServer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Version implements Comparable<Version>, Comparator<Version> {

	public ArrayList<Page> gPages;
	JSONObject all;
	
	String pathOfJsonFolder;
	String gVersionId;
	String gBookId;

	JSONArray fCanvas;

	
	
	Version(String bookId, String versionId,  boolean restore)
	{			

		fCanvas = new JSONArray();
		all = new JSONObject();

		gPages = new  ArrayList<Page>();
		gVersionId = versionId;
		gBookId = bookId;
		 pathOfJsonFolder = Global.filePath + Global.sep + bookId + Global.sep +  versionId + Global.sep +"JsonFolder"   + Global.sep;
	
		 
		 if (restore)
			 restore= restore;
		/*
		 {
				File folder = new File(pathOfJsonFolder);
				File[] listOfFiles = folder.listFiles();
				Global.mainLogger.info("Restoreing book: " + id);
				
			 for (File f : listOfFiles) 
			 {
			
	            Page p = new Page(null, bookId, f.getAbsolutePath());
	    		int found;    		
	    
	    		found = Collections.binarySearch(gPages, p);
	    		gPages.add(-found-1, p);	//keeping the sorted array
	
	    		

	    			fCanvas.put(p.json);
	    		
			 }
			}
			*/
		else
		{
			Global.mainLogger.info("creating version: " + versionId);
			//restore add
		}
		
		try {
			JSONObject sequenceElement = new JSONObject();
	
			sequenceElement.put("viewingDirection", "left-to-right");
			sequenceElement.put("viewingHint", "paged");
			sequenceElement.put("canvases", fCanvas);
			
			JSONArray sequences = new JSONArray();
			sequences.put(sequenceElement);
			
			all.put("description", "Default description");
			all.put("sequences", sequences);
			all.put("attribution", "Default attribution");
			all.put("@type", "sc:Manifest");
			all.put("label",versionId);
			
			
			
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		
	}
	
	public synchronized void removePage(String fileName) {
		Page search = new Page(fileName, gBookId, gVersionId);
		int found;
		
		 found = Collections.binarySearch(gPages, search);
		 
		 if (found < 0)
		 {
			 Global.mainLogger.info("tried to remove page: " + fileName + " ,version/book: " + gVersionId + "/" + gBookId);
			 return;
		 }
		 
		 gPages.get(found).remove();
		 gPages.remove(found);
	
		
	//	refreshCanvas();
		
	}

public void addToSql()
{
	Global.sqlAddVersion(gVersionId,gBookId);
	
}

	//creating the file and page, assuming the page not exists
public synchronized void createPage(FileItem fileUpdate, String fileName) throws Exception {
		
		
		Page search = new Page(fileName, gBookId, gVersionId);
		search.addPageToDatabase();
		synchronized (gPages)
		{
			int found = Collections.binarySearch(gPages, search);
			gPages.add(-found-1, search);	//keeping the sorted array
		}
		
		search.writePageFromUpload(fileUpdate, fileName);
		synchronized (fCanvas)
		{
			fCanvas.put(search.json);
		}
		
		
	}

public synchronized boolean existsPage(String fileName) {
	Page search = new Page(fileName, gBookId, gVersionId);
	int found;
	
	found = Collections.binarySearch(gPages, search);
	
	return (found >= 0);
}


@Override
public int compare(Version o1, Version o2) {
	// TODO Auto-generated method stub
	return o1.gVersionId.compareTo(o2.gVersionId);
	
}

@Override
public int compareTo(Version arg0) {
	// TODO Auto-generated method stub
	return this.gVersionId.compareTo(arg0.gVersionId);
}


	
}
