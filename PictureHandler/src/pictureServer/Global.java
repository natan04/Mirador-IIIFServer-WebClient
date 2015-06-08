package pictureServer;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Scanner;



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

    public static JSONArray bookArrayInfo = new JSONArray();
    
    public static String ImageServerAddress;
	public static String context = "http://iiif.io/api/image/2/context.json";
	public static String filePath;
	public static String sep;
	public static String bookInfoPath;
	public static String logPath ;

	public static Logger mainLogger = Logger.getLogger("com.appinf");

	//Codes:
	public static int imageUpload = 0;
	public static String imageUploadDesc = "Success to upload image";
	public static int imageAlreadyExists = 1;
	public static String imageAlreadyExistsDesc = "Image already exists, put ovrride flag to ovrride";
	public static int bookArentExists	= 2;
	public static String bookArentExistsDesc = "The book aren't exists";
	
	
	
	
	
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
		synchronized (gBooks) {
			
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
		
		gBooks.add(-found-1, search);	//keeping the sorted array
		
		}
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
   mainLogger.info("Paramers: sep: " + sep +" , image folder: " + filePath);
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
	temp.put(a);
	temp.put(b);
	printWriter.println(temp);
}
}