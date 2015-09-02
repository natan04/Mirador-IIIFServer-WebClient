package pictureServer;

import java.io.File;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Version implements Comparable<Version>, Comparator<Version> {

	public ArrayList<Page> gPages;
	JSONObject all;
	
	String gVersionId;
	String gBookId;

	JSONArray fCanvas;

	//only use by the invoker temp book.
	String iiifPathOfBaseImage; 
	JSONArray gTempInvokesCommendArray;
	AtomicInteger currentIndex = new AtomicInteger(0);
	AtomicInteger derivedFromIndex = new AtomicInteger(1);
	
	Version(String versionId)
	{
		gVersionId = versionId;

	}
	
	Version(String bookId, String versionId,  boolean restore)
	{			

		gTempInvokesCommendArray = new JSONArray();
		fCanvas = new JSONArray();
		all = new JSONObject();

		gPages = new  ArrayList<Page>();
		gVersionId = versionId;
		gBookId = bookId;
	
		 
		 if (restore)
		 {
				Global.mainLogger.info("Restoreing version  [version/book]: " + versionId + "/" + bookId);
				
				ResultSet rs =	Global.sqlPagesOfVersionAndBook(versionId, bookId);
				
				
				try {
					while ( rs.next() )
					      {

					    	  String nameOfPage = rs.getString("name");
					    	  String pathOfJson = Global.filePath + Global.sep + bookId + Global.sep + versionId + Global.sep + "JsonFolder" + Global.sep +  nameOfPage + ".json";
					    	  Page p = new Page(nameOfPage, bookId, versionId, pathOfJson);
					    	  int found;    		
					  	    
					    		found = Collections.binarySearch(gPages, p);
					    		gPages.add(-found-1, p);	//keeping the sorted array
					
					    		fCanvas.put(p.json);
					      }
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				 }
			
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
			all.put("label",gBookId);
			
			
			
			
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

public void removeMe()
{
	

	Global.sqlRemoveVersion(gVersionId, gBookId);
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

/*
 * fileName: string array. 	first element: real path of the page.
 * 							second element: iiif path (BOOK/VERSION/PAGE)
 */
public synchronized void createPageToTemp(String[] pathFile) throws Exception {
	
	
	File p = new File(pathFile[0]);
	
	Page search = new Page( pathFile[1]);

	int found = Collections.binarySearch(gPages, search);
	gPages.add(-found-1, search);	//keeping the sorted array
	
	search.createJsonForTemp(p, pathFile[1]);
	fCanvas.put(search.json);
	
	currentIndex.incrementAndGet();
	
}

public  boolean existsPage(String fileName) {
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
