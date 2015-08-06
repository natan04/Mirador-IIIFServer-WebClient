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
	public static String sqlDatabase = "C:\\Users\\Natan\\Desktop\\Server\\test.db";
	public static String filePath;
	public static String sep;
	public static String bookInfoPath;
	public static String logPath ;
	public static String defaultUploadFolder = "Default" ;
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
	Book search = new Book(id, false);
	
	int found = Collections.binarySearch(gBooks, search);
	if (found < 0)
	{
		return null;
	}
	
	else
		return gBooks.get(found);
}

public static Book getBook(String id)
{
	Book search = new Book(id, false);
	
	int found = Collections.binarySearch(gBooks, search);
	if (found < 0)
	{			
		bookArrayInfo.put(id);
        //file.getParentFile().mkdirs();
        
		try {
			PrintWriter out;
			File file = new File(bookInfoPath);
			out = new PrintWriter(bookInfoPath);
			out.println(bookArrayInfo.toString());
			out.close();
			
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		gBooks.add(-found-1, search);	//keeping the  array sorted
		
		search.addBookToDatabase();
		return search;
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
   bookInfoPath = filePath +"booksInfo.json";
   logPath =  context.getInitParameter("LogPath");
   mainLogger.info("Starting picture server");
   
   databaseInit();
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
	File f = new File(bookInfoPath);
	if (f.exists())
	{
		mainLogger.info("Restoring information from json database");

		try {
			Scanner sc = new Scanner(f);
			String line = sc.nextLine();
			sc.close();
			mainLogger.info("restoring book: " + line);

			bookArrayInfo = new JSONArray(line);
			
			for (int index = 0; index < bookArrayInfo.length(); index ++)
			{
				Book book = new Book((String) bookArrayInfo.get(index), true);
				int found = Collections.binarySearch(gBooks, book);
				gBooks.add(-found-1, book);	//keeping the sorted array

			}
			
		} catch (FileNotFoundException | JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	
	}

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
    Connection c = null;
    try {

    	Class.forName("org.sqlite.JDBC");
    
      c = DriverManager.getConnection("jdbc:sqlite:" + sqlDatabase);
    
      String sMakeTable_Book = "CREATE TABLE Books (serial_id_Book INTEGER primary key, name text primary key)";
      String sMakeTable_Version = "CREATE TABLE Versions (serial_id_Version INTEGER primary key, version_name text, book_id text,  FOREIGN KEY(book_id) REFERENCES Books(name))";
      String sMakeTable_Pages = "CREATE TABLE Pages (serial_id_page INTEGER primary key, name text, version_id INTEGER, FOREIGN KEY(version_id) REFERENCES Books(serial_id_Version)))";
      
      
      Statement stmt = c.createStatement();
      stmt.executeUpdate(sMakeTable_Book);
      stmt.executeUpdate(sMakeTable_Version);
  //    stmt.executeUpdate(sMakeTable_Pages);
      stmt.close();
    } catch ( Exception e ) {
      System.err.println( e.getClass().getName() + ": " + e.getMessage() );
      System.exit(0);
    }
    databaseConnection = c;
	
    mainLogger.info("Opened database successfully");
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



/*
public static void rollBackAction(String bookId, String fileName)
{
	Book search = new Book(bookId, false);
	
	int found = Collections.binarySearch(gBooks, search);
	if (found >= 0)
	{			
		search = gBooks.get(found);
		
		if (search.rollBackAction(fileName)) //not true;
			return;
		
		gBooks.remove(found);
		
		try {	

		for ( int index = 0; index < bookArrayInfo.length(); index ++)
		{
			if (bookArrayInfo.getString(index).compareTo(bookId) == 0)
			{
				bookArrayInfo.remove(index);
				break;
			}
		}
		PrintWriter out;
		File file = new File(bookInfoPath);
		out = new PrintWriter(bookInfoPath);
		out.println(bookArrayInfo.toString());
		out.close();
		
	} catch (FileNotFoundException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
			} catch (JSONException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
		}
	}
*/
}