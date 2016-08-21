package com.pictureserver;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

//configure headers
		response.addHeader("Access-Control-Allow-Origin",
				"http://localhost:8000");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		response.addHeader("Access-Control-Allow-Methods", "GET, POST");
		response.addHeader("Access-Control-Allow-Headers ", "Content-Type, *");
		response.setContentType("application/json");

		HttpSession session = request.getSession();

		String idOfBook = request.getParameter("id");
		Global.mainLogger.info("* JSON * Json request from session:"
				+ session.getId());
		PrintWriter printWriter = response.getWriter();

		if (idOfBook == null) 
			return;

		if (idOfBook.compareTo("all") == 0) 
		{
			Global.mainLogger.info("* JSON * \"ALL\" id received. sending Json base array to:"
					+ request.getRemoteAddr());
			printWriter.println(Global.getListOfBook());
		} 
		else
		{
			Book book = Global.getIfHaveBook(idOfBook);
			if (book != null) {
				Global.mainLogger.info("* JSON * sending database book \"" + book.gBookId
						+ "\" to: " + session);
				printWriter.println(book.toString());
			} else {
				Global.respond(printWriter, Global.bookArentExists,
						Global.bookArentExistsDesc);
			}
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

	}

}
