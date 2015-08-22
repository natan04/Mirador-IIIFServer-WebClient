package pictureServer;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Scanner;
import java.sql.*;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;




















import com.sun.java_cup.internal.runtime.Symbol;

@SuppressWarnings("serial")
public class Global extends HttpServlet {
    public static ArrayList<Book> gBooks;

    public static Connection databaseConnection;
    public static JSONArray bookArrayInfo = new JSONArray();
    
    public static String ImageServerAddress;
	public static String context = "http://iiif.io/api/image/2/context.json";
	public static String sqlDatabase ;
	public static String filePath;
	public static String sep;
	public static String logPath ;
	public static String defaultUploadFolder = "default" ;
	public static boolean convertToTiff = false; 
	public static Logger mainLogger = Logger.getLogger("com.appinf");

	//Codes:
	public static int imageUpload = 0;
	public static String imageUploadDesc = "Success to upload image";
	
	public static int imageAlreadyExists = 1;
	public static String imageAlreadyExistsDesc = "Image already exists, put ovrride flag to ovrride";
	
	public static int bookArentExists	= 2;
	public static String bookArentExistsDesc = "The book aren't exists";
	
	public static int problemToUploadImage = 3;
	public static String problemToUploadImageDesc = "Problem with upload, wrong format?";

	public static String emptyFileName = "Empty file name";
	
	
	
	
public static String getListOfBook()
{	
	return bookArrayInfo.toString();
}

public static Book getIfHaveBook(String id)
{
	Book search = new Book(id);
	
	int found = Collections.binarySearch(gBooks, search);
	if (found < 0)
	{
		return null;
	}
	
	else
		return gBooks.get(found);
}

public static void removeVersion(String bookId, String versionId)
{
	Book book = getBook(bookId);
	book.removeVersion(versionId);
}

public static Book getBook(String id)
{
	Book search = new Book(id);
	
	int found = Collections.binarySearch(gBooks, search);
	if (found < 0)
	{			
		Book newBook = new Book(id, false);

		bookArrayInfo.put(id);
        //file.getParentFile().mkdirs();
        
		gBooks.add(-found-1, newBook);	//keeping the  array sorted
		
		newBook.addBookToDatabase();
		return newBook;
	}
	
	else
		return gBooks.get(found);
}


public void init() throws ServletException
{

   ServletContext context = getServletContext();
   ImageServerAddress = context.getInitParameter("ImageServerAddress");
   sep = File.separator;
   filePath =  context.getInitParameter("ImageFolder");
   sqlDatabase = filePath + sep + "Picture.db";
   logPath =  context.getInitParameter("LogPath");
   mainLogger.info("Starting picture server");
   
	/*****************Log initlize**************/
	try {
		Handler fileHandler = new FileHandler(logPath,true);
		fileHandler.setFormatter(new SimpleFormatter());
		mainLogger.addHandler(fileHandler);
		mainLogger.info("\n\n\n\n\n\n\n\n\n&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
	
	} catch (SecurityException | IOException e1) {
		// TODO Auto-generated catch block
		e1.printStackTrace();
	}
	
	
	
	mainLogger.info("Paramers: sep: " + sep +" , image folder: " + filePath + "server: " + ImageServerAddress );
	gBooks = new ArrayList<Book>();
	
	databaseInit();
	

}

public static void respond(PrintWriter printWriter, int a,
		String b) {

	JSONArray temp = new JSONArray(); 
	temp.put(a +"");
	temp.put(b);
	printWriter.println(temp);
}





public void databaseInit()
{
 
    try {

    	Class.forName("org.sqlite.JDBC");

    	  final File f = new File(sqlDatabase);
    	  
    	  if (f.exists())
    	  {
    		  databaseConnection = DriverManager.getConnection("jdbc:sqlite:" + sqlDatabase);
    		  Global.mainLogger.info("database exists, starting to restore");
    		  recoverPictureHandler();
    	  }
	    
    	  else{
    		  
    		  Global.mainLogger.info("database doesn't exists, creating database...");
    		  databaseConnection = DriverManager.getConnection("jdbc:sqlite:" + sqlDatabase);

		      String sMakeTable_Book = "CREATE TABLE Books (serial_id_Book INTEGER primary key, name text)";
		      String sMakeTable_Version = "CREATE TABLE Versions (serial_id_Version INTEGER primary key, version_name text, book_id text,  FOREIGN KEY(book_id) REFERENCES Books(name))";
		      String sMakeTable_Pages = "CREATE TABLE Pages (serial_id_page INTEGER primary key, name text, version_id text, book_id text, FOREIGN KEY(version_id) REFERENCES Books(serial_id_Version))";
		      
		      
		      Statement stmt = databaseConnection.createStatement();
		      stmt.executeUpdate(sMakeTable_Book);
		      stmt.executeUpdate(sMakeTable_Version);
		      stmt.executeUpdate(sMakeTable_Pages);
		      stmt.close();
    	  }
    	} catch ( Exception e ) {
      System.err.println( e.getClass().getName() + ": " + e.getMessage() );
      System.exit(0);
    }
	
    mainLogger.info("Opened database successfully");
}


public static ResultSet sqlVersionsOfBook(String bookId)
{
	String queryGetBookVersion = "SELECT version_name FROM \"Versions\" where book_id == \"" + bookId + "\";";
	ResultSet rs = null;;  
	
	try{
		synchronized (databaseConnection) {
			Statement stmt = databaseConnection.createStatement();
			rs = stmt.executeQuery(queryGetBookVersion);
		}
		} catch (SQLException e)
		{
			e.printStackTrace();
		}
	return rs;
}

public static ResultSet sqlPagesOfVersionAndBook(String version, String book)
{
	String queryGetPages = "SELECT name FROM Pages where book_id = \"" + book + "\" AND version_id = \"" + version +"\";";
	ResultSet rs = null;;  
	
	try{
		synchronized (databaseConnection) {
			Statement stmt = databaseConnection.createStatement();
			rs = stmt.executeQuery(queryGetPages);
		}
		} catch (SQLException e)
		{
			e.printStackTrace();
		}
	return rs;
}

private void recoverPictureHandler()
{

	String queryGetBooks = "SELECT name FROM \"Books\";";
	ResultSet rs;  
	try {
			synchronized (databaseConnection) {

				Statement stmt = databaseConnection.createStatement();
				rs = stmt.executeQuery(queryGetBooks);
			}	
			      while ( rs.next() )
			      {
			    	  String nameOfBook = rs.getString("name");
			    	  Book search = new Book(nameOfBook, true);
			          //file.getParentFile().mkdirs();
			          
			  	
			    	int found = Collections.binarySearch(gBooks, search);

			  		gBooks.add(-found-1, search);	//keeping the  array sorted
			  		bookArrayInfo.put(nameOfBook);
			  		
			  	}
			     
			
	    } catch (SQLException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	 }
	
}

public static void SqlAddBook(String bookid) {
	
	/*
	 * Sql section
	 */

	String sqlBook = "INSERT INTO Books " +
			"VALUES ( NULL,\""+ bookid + "\" );"; 
	
	synchronized (databaseConnection) {
		
	      try {
	    	  Statement stmt = Global.databaseConnection.createStatement();
	    	  stmt.executeUpdate(sqlBook);
				Global.mainLogger.info("add to database:" + bookid);

	      } catch (SQLException e) {
			Global.mainLogger.severe("Problem adding to sql");

			e.printStackTrace();
		}

	}
}

//remove version and pages assosiate 
public static void sqlRemoveVersion(String version, String book) {
	
	String sqlVersionRemove = "DELETE FROM versions " +
			"where version_name = "+ version + " AND book_id \"" +  book + "\");"; 

	String sqlPageRemove = "DELETE FROM Pages " +
			"where version_id = "+ version + " AND book_id \"" +  book + "\");"; 
	
	

	synchronized (databaseConnection) {
		
	      try {
	    	  Statement stmt = Global.databaseConnection.createStatement();
	    	  stmt.executeUpdate(sqlVersionRemove);
	    	  stmt.executeUpdate(sqlPageRemove);
				Global.mainLogger.info("add to database version/book:" + version + "/" + book);

	      } catch (SQLException e) {
			Global.mainLogger.severe("Problem adding to sql");

			e.printStackTrace();
		}

	}
}

public static void sqlAddVersion(String version, String book) {
	
	String sqlVersion = "INSERT INTO Versions " +
			"VALUES ( NULL,\""+ version + "\", \"" +  book + "\");"; 
	
	synchronized (databaseConnection) {
		
	      try {
	    	  Statement stmt = Global.databaseConnection.createStatement();
	    	  stmt.executeUpdate(sqlVersion);
				Global.mainLogger.info("add to database version/book:" + version + "/" + book);

	      } catch (SQLException e) {
			Global.mainLogger.severe("Problem adding to sql");

			e.printStackTrace();
		}

	}
}

public static void SqlAddPage(String pageName, String versionName,
		String bookName) {

	String sqlPage = "INSERT INTO pages " +
			"VALUES ( NULL,\""+ pageName  + "\", \"" +  versionName + "\", \"" + bookName + "\");"; 
	
	synchronized (databaseConnection) {
		
	      try {
	    	  Statement stmt = Global.databaseConnection.createStatement();
	    	  stmt.executeUpdate(sqlPage);
				Global.mainLogger.info("add page to database [page/version/book]:" + pageName + "/" + versionName + "/" + bookName);

	      } catch (SQLException e) {
			Global.mainLogger.severe("Problem adding to sql");

			e.printStackTrace();
		}

	}
}


}