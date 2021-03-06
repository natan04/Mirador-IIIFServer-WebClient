package com.pictureserver;



import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.*;

//import com.sun.istack.internal.logging.Logger;
//import org.apache.commons.fileupload.FileItem;
//import org.apache.commons.fileupload.FileUploadException;
//import org.apache.commons.fileupload.disk.DiskFileItemFactory;
//import org.apache.commons.fileupload.servlet.ServletFileUpload;
//import org.apache.commons.io.output.*;
/**
 * Servlet implementation class Upload
 */
@WebServlet("/Upload")
public class Upload extends HttpServlet {
	private static final long serialVersionUID = 1L;
	  private boolean isMultipart;
	   private int maxFileSize = 10	*1024 * 1024;
	   private int maxMemSize =  10	* 1024 * 1024;
 
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Upload() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		
        response.setContentType("text/html");
        PrintWriter printWriter  = response.getWriter();
        printWriter.println("<h1>upload!</h1>");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{

        HttpSession session = request.getSession();

		response.addHeader("Access-Control-Allow-Origin", "http://localhost:8000");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		response.addHeader("Access-Control-Allow-Methods", "GET, POST");
		response.addHeader("Access-Control-Allow-Headers ", "Content-Type, *");
		FileItem fileUpdate = null;
		String bookId = null;
		String fileName = null ;
		final String ID_Field = "ID";

		isMultipart = ServletFileUpload.isMultipartContent(request);
	      java.io.PrintWriter out = response.getWriter( );
	      if( !isMultipart ){
	         out.println("<html>");
	         out.println("<head>");
	         out.println("<title>Servlet upload</title>");  
	         out.println("</head>");
	         out.println("<body>");
	         out.println("<p>No file uploaded</p>"); 
	         out.println("</body>");
	         out.println("</html>");
	         return;
	      }
	      DiskFileItemFactory factory = new DiskFileItemFactory();
	      // maximum size that will be stored in memory
	      factory.setSizeThreshold(maxMemSize);
	      // Location to save data that is larger than maxMemSize.
	      factory.setRepository(new File("C:\\Users\\Natan\\Desktop"));

	      // Create a new file upload handler
	     ServletFileUpload upload = new ServletFileUpload(factory);
      // maximum file size to be uploaded.
	      upload.setSizeMax( maxFileSize );

	      try{ 
	      // Parse the request to get file items.
	      List fileItems = upload.parseRequest(request);
		
	      // Process the uploaded file items
	      Iterator i = fileItems.iterator();
	      while ( i.hasNext () ) 
	      {
	         FileItem fi = (FileItem)i.next();
	         if ( !fi.isFormField () )	
	         {
	        	 fileUpdate = fi;

	         }
	         else 
	         {
	        	if (ID_Field.compareTo(fi.getFieldName()) == 0)
	        	{
	        		 bookId = fi.getString();
	        	
	        	}
	         }
	      }
	   
	      
	    
	      if (bookId.length() == 0)
	      {
			   Global.respond(out, Global.problemToUploadImage, Global.emptyFileName);
			   Global.mainLogger.info("* UPLOAD * Error uploading page: " + fileName + " empty file name");;
			   return;
	      }
	      
	      
	      boolean override = true;
	      
	      if (bookId != null && fileUpdate != null)
	      {
	            fileName = getFileName(fileUpdate);
	                   
	            Book book = Global.getBook(bookId);
	            Version version = book.getDefaultVersion();
	    		Global.mainLogger.info("* UPLOAD * update request from ip: " + request.getRemoteAddr() + "book: \"" + bookId +"\" page: \"" + fileName +"\"" );
	            
	           if (version.existsPage(fileName))
	           {
	        	   if (override)
	        	   {
	        		   version.removePage(fileName);
	        	   }
	        	   else
	        	   {
	        		   Global.respond(out, Global.imageAlreadyExists, Global.imageAlreadyExistsDesc);
	        		   return;
	        	   }	
	           }
	            
	           version.createPage(fileUpdate, fileName);
	           
			  Global.respond(out, Global.imageUpload, Global.imageUploadDesc);


	
	      }
	   }catch(Exception ex) {
   		Global.mainLogger.severe("* UPLOAD * exception while uploading page. book: \"" + bookId + "\" page: \"" + fileName +"\"");
                ex.printStackTrace();

	   }
	

}

	//get picture file name after removing slashes
	private String getFileName(FileItem fileUpdate)
	{
		
        String name = fileUpdate.getName();    
        if( name.lastIndexOf("\\") >= 0 )
        {
        	return name.substring(name.lastIndexOf("\\") + 1);
        }
        else if(name.lastIndexOf("/") >= 0)
        	{
        		return name.substring(name.lastIndexOf("/")+1) ;
        	}
        else
        {
        	return name;
        }
      
	}
	
	
}
	
