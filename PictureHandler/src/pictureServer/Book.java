package pictureServer;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Scanner;

import javax.imageio.ImageIO;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class Book implements Comparable<Book>, Comparator<Book> {

    public ArrayList<Page> gPages;

	String bookId = null;
	JSONArray fCanvas;
	JSONObject all;
    String pathOfJsonFolder;

	String getId()
	{
		return bookId;
	}
	
Book(String id, boolean restore)
	{			
		fCanvas = new JSONArray();

		gPages = new ArrayList<Page>();
		bookId = id;
		 pathOfJsonFolder = Global.filePath + Global.sep + bookId + Global.sep + "JsonFolder" + Global.sep;
		if (restore)
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
		else
		{
			Global.mainLogger.info("creating book: " + id);

		}
		
		try {
			JSONObject sequenceElement = new JSONObject();
	
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
			all.put("label",bookId);
			
			
			
			
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		
	}
	
	
synchronized private void refreshCanvas()
{
	fCanvas = new JSONArray();
	Global.mainLogger.info("Refreshing canvas");
	synchronized (gPages)
		{
		for (Page p : gPages)
		{
			fCanvas.put(p.json);
		}
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

public synchronized boolean existsPage(String fileName) {
		Page search = new Page(fileName, bookId);
		int found;
		
		found = Collections.binarySearch(gPages, search);
		
		return (found >= 0);
	}

public synchronized void removePage(String fileName) {
		Page search = new Page(fileName, bookId);
		int found;
		
		 found = Collections.binarySearch(gPages, search);
		 
		 if (found < 0)
		 {
			 Global.mainLogger.info("tried to remove page: " + fileName + " ,book: " + bookId);
			 return;
		 }
		 
		 gPages.get(found).remove();
		 gPages.remove(found);
	
		
		refreshCanvas();
		
	}

	//creating the file and page, assuming the page not exists
public synchronized void createPage(FileItem fileUpdate, String fileName) throws Exception {
		
		
		Page search = new Page(fileName, bookId);
		synchronized (gPages)
		{
			int found = Collections.binarySearch(gPages, search);
			gPages.add(-found-1, search);	//keeping the sorted array
		}
		
		search.writePage(fileUpdate, fileName);
		synchronized (fCanvas)
		{
			fCanvas.put(search.json);
		}
		
	}

public synchronized boolean rollBackAction(String fileName) {
	Page search = new Page(fileName, bookId);
	int found;
	
	 found = Collections.binarySearch(gPages, search);
	 gPages.get(found).removeRollBack();
	 gPages.remove(found);
	 
	 if (gPages.size() == 0)
		 return false;
	 
	 return true;
	
}
	
	
	
}
