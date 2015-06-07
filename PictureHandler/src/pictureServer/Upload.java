package pictureServer;



import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.*;

import com.sun.istack.internal.logging.Logger;
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
	   private File file ;
 
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

	
		FileItem fileUpdate = null;
		String fieldId = null;
		String fileName ;
		final String ID_Field = "ID";

		isMultipart = ServletFileUpload.isMultipartContent(request);
	      response.setContentType("text/html");
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

	      out.println("<html>");
	      out.println("<head>");
	      out.println("<title>Servlet upload</title>");  
	      out.println("</head>");
	      out.println("<body>");
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
	        		 fieldId = fi.getString();
	        	
	        	}
	         }
	      }
	      out.println("</body>");
	      out.println("</html>");
	      
	      if (fieldId != null && fileUpdate != null)
	      {
	            String fieldName = fileUpdate.getFieldName();
	            fileName = fileUpdate.getName();
	          
	            if( fileName.lastIndexOf("\\") >= 0 ){
	               file = new File( Global.filePath  + Global.sep + fieldId + Global.sep+
	               fileName.substring( fileName.lastIndexOf("\\") + 1)) ;
	            }else if(fileName.lastIndexOf("/") >= 0){
	               file = new File( Global.filePath +  Global.sep + fieldId + Global.sep+
	               fileName.substring(fileName.lastIndexOf("/")+1)) ;
	            }
	            else
	            {
		               file = new File( Global.filePath +  Global.sep + fieldId + Global.sep+
		    	               fileName) ;
	            }
	          
	          file.getParentFile().mkdirs();
				

	          fileUpdate.write( file ) ;
	          Global.mainLogger.info("saving file:" +file.getName() + "to folder: " + fieldId);
	          out.println("Uploaded Filename: " + fileName + "<br>");
	    	  Book book = Global.getBook(fieldId);
	    	  book.addPage(file);
	      }
	   }catch(Exception ex) {
	       System.out.println(ex);
	   }
	

}
	
	
}
	
