package pictureServer;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.sql.Statement;
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

    public ArrayList<Version> gVersions;

	String gBookId = null;
	JSONArray fCanvas;
	
	JSONArray all;
    String pathOfJsonFolder;

	String getId()	
	{
		return gBookId;
	}
	
Book(String bookid, boolean restore)
	{			
		fCanvas = new JSONArray();
		all = new JSONArray();
		gVersions = new ArrayList<Version>();
		gBookId = bookid;
		 pathOfJsonFolder = Global.filePath + Global.sep + bookid + Global.sep + "JsonFolder" + Global.sep;
	
		 
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
			
			Global.mainLogger.info("creating book: " + bookid);
			
			
			//creating first default folder.
			Version ver = new Version(bookid, "default", false);
			all.put(ver.all);
			gVersions.add(ver);

			ver.addToSql();

		}
		

		
	}
	

void addBookToDatabase()
{
	Global.SqlAddBook(gBookId);
	
}

	/*
synchronized private void refreshCanvas()
{
	fCanvas = new JSONArray();
	Global.mainLogger.info("Refreshing canvas");
	synchronized (gVersions)
		{
		for (Page p : gPages)
		{
			fCanvas.put(p.json);
		}
	}
}
*/
	
public String toString() {
		
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

	public Version getDefaultVersion() {

		Version search = new Version(gBookId, "default", false);
		
		int found = Collections.binarySearch(gVersions, search);
		if (found < 0)
		{
			
			Global.mainLogger.severe("Problem return default version of book: " + gBookId);
			return null;
		}
		
		else
			return gVersions.get(found);
		
			}
}