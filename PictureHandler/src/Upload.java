


import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
import java.util.List;

import javax.imageio.ImageIO;
import javax.json.JsonObject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.*;
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
	   private String filePath;
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

		 
	
	      filePath = 
	              getServletContext().getInitParameter("file-upload"); 
		// Check that we have a file upload request
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
	            // Get the uploaded file parameters
	            String fieldName = fi.getFieldName();
	            String fileName = fi.getName();
	            String contentType = fi.getContentType();
	            boolean isInMemory = fi.isInMemory();
	            long sizeInBytes = fi.getSize();
	            // Write the file
	            if( fileName.lastIndexOf("\\") >= 0 ){
	               file = new File( filePath + 
	               fileName.substring( fileName.lastIndexOf("\\"))) ;
	            }else{
	               file = new File( filePath + 
	               fileName.substring(fileName.lastIndexOf("\\")+1)) ;
	            }
	            imageToAll(file, "IdOfBOOKS");
	            fi.write( file ) ;
	            out.println("Uploaded Filename: " + fileName + "<br>");
	            
	      
	         }
	      }
	      out.println("</body>");
	      out.println("</html>");
	   }catch(Exception ex) {
	       System.out.println(ex);
	   }
	

}
	
	void imageToAll(File aFile,String idBook) throws JSONException
	{
		String name = "http://imagesrv/iipsrv/";
		String port = "80";
		String spec = "full/full/0/default.jpg";
		String context = "http://iiif.io/api/image/2/context.json";
		String idRes = name + idBook + "/" + aFile.getName() + "/full/full/0/default.jpg";
		String idSer = name + idBook + "/" + aFile.getName();
		String typeImage = "dctypes:Image";
		String typeCanvas = "sc:Canvas";
		String label = "Default label";
		
	      BufferedImage img = null;
          try {
              img = ImageIO.read(new File(aFile.getPath()));
              System.out.println("height:" + img.getHeight() + " width:" + img.getWidth());
              JSONObject toReturn = new JSONObject();

              		  JSONObject firstImage = new JSONObject() ;
		              firstImage.put("width", img.getWidth());
		              firstImage.put("height", img.getHeight());
		              
		              	JSONObject resource = new JSONObject() ;
		              	resource.put("@id", idRes);
		              
		              		JSONObject service = new JSONObject() ;
		              		service.put("@context", context);
		              		service.put("@id", idSer);
		              	
		              	resource.put("service", service);
		              	
		              firstImage.put("resource", resource);
		              
		              firstImage.put("@type", typeImage);
		              firstImage.put("format", "image/jpeg");
              
	            toReturn.append("images", firstImage);
   
	            toReturn.put("width", img.getWidth());
	            toReturn.put("height", img.getHeight());

	            toReturn.put("@type", typeCanvas);
	            toReturn.put("@type", label);
              System.out.println(toReturn.toString());
          } catch (IOException e) {
          }
	
    
          
	
	}
	
}
	
