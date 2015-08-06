package pictureServer;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
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

    public ArrayList<Version> gVersions; //list of VERSION object
    JSONObject versionsJson;

	String gBookId = null;
	
    String pathOfJsonFolder;

	String getId()	
	{
		return gBookId;
	}
	
Book(String bookid)
{
	gBookId = bookid;

}
	
Book(String bookid, boolean restore)
	{			
		versionsJson = new JSONObject();
		gVersions = new ArrayList<Version>();
		gBookId = bookid;
	
		 
		 if (restore)
		
		 {
	
				Global.mainLogger.info("Restoreing book: " + gBookId);
				
				ResultSet rs = Global.sqlVersionsOfBook(bookid);
			
				  try {
					while ( rs.next() )
					  {
						  String nameOfVersion = rs.getString("version_name");
						  Version ver = new Version(gBookId, nameOfVersion, true);

						  int found = Collections.binarySearch(gVersions, ver);
						  gVersions.add(-found-1, ver);	//keeping the sorted array
						
						  versionsJson.put(nameOfVersion,ver.all);


					  }
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			
			}
			
		else
		{
			
			Global.mainLogger.info("creating book: " + bookid);
			
			
			//creating first default folder.
			Version ver = new Version(bookid, "default", false);
			try {
				versionsJson.put("default", ver.all);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			gVersions.add(ver);

			ver.addToSql();

		}
		

		
	}
	

void addBookToDatabase()
{
	Global.SqlAddBook(gBookId);
	
}

public void removeVersion(String version)
{
	Version ver = new Version(version);	
	int foundIndex = Collections.binarySearch(gVersions, ver);
	
	ver = gVersions.get(foundIndex); //the real version;
	
	versionsJson.remove(ver.gVersionId);	//remove from json
	ver.removeMe();							//remove from sql
	gVersions.remove(foundIndex);			//remove from list
	
}
	
public String toString() {
		
	return versionsJson.toString();
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