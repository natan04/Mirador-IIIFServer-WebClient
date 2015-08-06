package pictureServer;


import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Json
 */
@WebServlet("/Json")
public class Json extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Json() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	
		response.addHeader("Access-Control-Allow-Origin", "*");
		String idOfBook = request.getParameter("id");
		Global.mainLogger.info("Get Json request from ip:" + request.getRemoteAddr());
		PrintWriter printWriter  = response.getWriter();
		
		if (idOfBook == null)
		{

			return;
		}
		
		if (idOfBook.compareTo("all") ==0)
		{
			Global.mainLogger.info("send Json base array to:" + request.getRemoteAddr());
			printWriter.println(Global.getListOfBook());
		}
		else
		{
			Book book = Global.getIfHaveBook(idOfBook);
			if (book != null)
			{
				Global.mainLogger.info("send  database book" + book.gBookId + " to:" + request.getRemoteAddr());
				printWriter.println(book.toString());
			}
			else
			{
				Global.respond(printWriter, Global.bookArentExists, Global.bookArentExistsDesc);
			}
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

	}

}
