package pictureServer;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Scanner;

import javax.json.JsonArray;
import javax.json.JsonObject;
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
    
    public static String gNameOfServer = "http://imagesrv/iipsrv/";
	public static String context = "http://iiif.io/api/image/2/context.json";
	public static String filePath = "C:\\Users\\Natan\\Desktop\\ira\\";
	public static String sep = "\\";
	public static String bookInfoPath = filePath +"booksInfo.json";

	
public static String getListOfBook()
{
	
	return bookArrayInfo.toString();
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

	gBooks = new ArrayList<Book>();
	File f = new File(bookInfoPath);
	if (f.exists())
	{
		try {
			Scanner sc = new Scanner(f);
			String line = sc.nextLine();
			sc.close();
			
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
}