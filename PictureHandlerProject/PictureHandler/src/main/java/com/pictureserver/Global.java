package com.pictureserver;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Scanner;
import java.sql.*;
import java.util.concurrent.atomic.AtomicInteger;
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

//import com.sun.java_cup.internal.runtime.Symbol;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@SuppressWarnings("serial")
public class Global extends HttpServlet {
	public static ArrayList<Book> gBooks;

	public static Connection databaseConnection;
	public static JSONArray bookArrayInfo = new JSONArray();

	public static String ImageServerAddress;
	public static String context = "http://iiif.io/api/image/2/context.json";
	public static String sqlDatabase;
	public static String filePath;
	public static String sep;
	public static String logPath;
	public static String defaultUploadFolder = "default";
	public static boolean convertToTiff = false;
	public static Logger mainLogger = Logger.getLogger("com.appinf");
	public static String ExePath;
	public static Book InvokerPreviewBook; // each session is a version.
	public static String tempFolderPath;
	public static String tempFolderName = "temp";
	public static String tempBookStr = tempFolderName;
	public static String jsonFunctionPath;
	public static AtomicInteger tempIndex = new AtomicInteger(0);

	// Codes:

	public static int invokerCmmnd = 0;
	public static String invokerCmmndDesc = "Yeyyyyy";

	public static int invokerProblem = 0;
	public static String invokerProblemDesc = "oops, do it again";

	public static int imageUpload = 0;
	public static String imageUploadDesc = "Success to upload image";

	public static int imageAlreadyExists = 1;
	public static String imageAlreadyExistsDesc = "Image already exists, put ovrride flag to ovrride";

	public static int bookArentExists = 2;
	public static String bookArentExistsDesc = "The book aren't exists";

	public static int problemToUploadImage = 3;
	public static String problemToUploadImageDesc = "Problem with upload, wrong format?";

	public static String emptyFileName = "Empty file name";

	/**
	 * @return list of books
	 */
	public static String getListOfBook() {
		return bookArrayInfo.toString();
	}

	/**
	 * 
	 * @param id name of book
	 * @return book if exists, null otherwise
	 */
	public static Book getIfHaveBook(String id) {
		Book search = new Book(id);

		int found = Collections.binarySearch(gBooks, search);
		if (found < 0) {
			return null;
		}

		else
			return gBooks.get(found);
	}


/**
 * 
 * @param id name of book
 * @return Book curresponding to name of book
 */
	public static Book getBook(String id) {
		Book search = new Book(id);

		int found = Collections.binarySearch(gBooks, search);
		if (found < 0) {
			Book newBook = new Book(id, false, true);

			bookArrayInfo.put(id);
			// file.getParentFile().mkdirs();

			gBooks.add(-found - 1, newBook); // keeping the array sorted

			newBook.addBookToDatabase();
			return newBook;
		}

		else
			return gBooks.get(found);
	}

        protected static String dumpConfig() {
            return "Image Server URL: " + ImageServerAddress + 
                   "\nSeperator: " + sep +
                   "\nImages local path: " + filePath +
                   "\nFunctions JSON local path: " + jsonFunctionPath +
                   "\nLog file local path: " + logPath;
        }
        
        
	/**
	 * init function use by apache tomcat
	 */
	public void init() throws ServletException {


		ServletContext context = getServletContext();

//Variable configuration
		ImageServerAddress = context.getInitParameter("ImageServerAddress");
		sep = File.separator;
		filePath = context.getInitParameter("ImageFolder");
		sqlDatabase = filePath + sep + "Picture.db";
		logPath = context.getInitParameter("LogPath");
		mainLogger.info("Starting picture server");
		ExePath = context.getInitParameter("ExePath");
		jsonFunctionPath = context.getInitParameter("JsonFunctions");

		tempFolderPath = filePath + sep + "temp";
		/***************** Log initlize **************/
		try {
			Handler fileHandler = new FileHandler(logPath, true);
			fileHandler.setFormatter(new SimpleFormatter());
			mainLogger.addHandler(fileHandler);
			mainLogger
					.info("\n\n\n\n\n\n\n\n\n&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

		} catch (SecurityException | IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

                mainLogger.info("\n\n\n***** PictureHandler Config ******\n\n" + dumpConfig() + "\n\n********************************\n\n");

                
                gBooks = new ArrayList<Book>();
		databaseInit();

		InvokerPreviewBook = new Book(tempBookStr, false, false);

	}

/**
 * Function that respond to client	
 * @param printWriter
 * @param statusNumber 
 * @param describeText
 */
	public static void respond(PrintWriter printWriter, int statusNumber, String describeText) {

		JSONArray temp = new JSONArray();
		temp.put(statusNumber + "");
		temp.put(describeText);
		printWriter.println(temp);
	}

	/**
	 * 
	 * @return connection to sql databse
	 * @throws SQLException
	 */
	public static Connection getDatabaseNewConnection() throws SQLException {
		return DriverManager.getConnection("jdbc:sqlite:" + sqlDatabase);
	}

	/**
	 * initilize databse
	 */
	public void databaseInit() {

		try {

			Class.forName("org.sqlite.JDBC");

			final File f = new File(sqlDatabase);

			if (f.exists()) {
				databaseConnection = DriverManager.getConnection("jdbc:sqlite:"
						+ sqlDatabase);
				Global.mainLogger.info("database exists, starting to restore");
				recoverPictureHandler();
			}

			else {

				Global.mainLogger
						.info("database doesn't exists, creating database...");
				databaseConnection = DriverManager.getConnection("jdbc:sqlite:"
						+ sqlDatabase);

				String sMakeTable_Book = "CREATE TABLE Books (serial_id_Book INTEGER primary key, name text)";
				String sMakeTable_Version = "CREATE TABLE Versions (serial_id_Version INTEGER primary key, version_name text, book_id text,  FOREIGN KEY(book_id) REFERENCES Books(name))";
				String sMakeTable_Pages = "CREATE TABLE Pages (serial_id_page INTEGER primary key, name text, version_id text, book_id text, FOREIGN KEY(version_id) REFERENCES Books(serial_id_Version))";
				String sMakeTable_Preview = "CREATE TABLE Preview (session_id text, current_picture text, json text, max_index INTEGER, json_cmmnd text)";
				String sMakeTable_flows = "CREATE TABLE flows (flow_id text, json_history text)";

				Statement stmt = databaseConnection.createStatement();
				stmt.executeUpdate(sMakeTable_Book);
				stmt.executeUpdate(sMakeTable_Version);
				stmt.executeUpdate(sMakeTable_Pages);
				stmt.executeUpdate(sMakeTable_Preview);
				stmt.executeUpdate(sMakeTable_flows);

				stmt.close();
			}
		} catch (Exception e) {
			System.err.println(e.getClass().getName() + ": " + e.getMessage());
			System.exit(0);
		}

		mainLogger.info("Opened database successfully");
	}

	/**
	 * 
	 * @param bookId
	 * @return list of all versions 
	 */
	public static ResultSet sqlVersionsOfBook(String bookId) {
		String queryGetBookVersion = "SELECT version_name FROM \"Versions\" where book_id == \""
				+ bookId + "\";";
		ResultSet rs = null;
		;

		try {
			synchronized (databaseConnection) {
				Statement stmt = databaseConnection.createStatement();
				rs = stmt.executeQuery(queryGetBookVersion);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return rs;
	}

	/**
	 * 
	 * @param version
	 * @param book
	 * @return result with name and pages
	 */
	public static ResultSet sqlPagesOfVersionAndBook(String version, String book) {
		String queryGetPages = "SELECT name FROM Pages where book_id = \""
				+ book + "\" AND version_id = \"" + version + "\";";
		ResultSet rs = null;
		;

		try {
			synchronized (databaseConnection) {
				Statement stmt = databaseConnection.createStatement();
				rs = stmt.executeQuery(queryGetPages);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return rs;
	}

/*
 * Recover picture handler from databse	
 */
	private void recoverPictureHandler() {

		String queryGetBooks = "SELECT name FROM \"Books\";";
		ResultSet rs;
		try {
			synchronized (databaseConnection) {

				Statement stmt = databaseConnection.createStatement();
				rs = stmt.executeQuery(queryGetBooks);
			}
			while (rs.next()) {
				String nameOfBook = rs.getString("name");
				Book search = new Book(nameOfBook, true, false);
				// file.getParentFile().mkdirs();

				int found = Collections.binarySearch(gBooks, search);

				gBooks.add(-found - 1, search); // keeping the array sorted
				bookArrayInfo.put(nameOfBook);

			}

		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

/**
 * add book to sql database
 * @param bookid name of book
 */
	public static void SqlAddBook(String bookid) {

		/*
		 * Sql section
		 */

		String sqlBook = "INSERT INTO Books " + "VALUES ( NULL,\"" + bookid
				+ "\" );";

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

/**
 * add version to sql
 * @param version version name
 * @param book book name
 */
	public static void sqlAddVersion(String version, String book) {

		String sqlVersion = "INSERT INTO Versions " + "VALUES ( NULL,\""
				+ version + "\", \"" + book + "\");";

		synchronized (databaseConnection) {

			try {
				Statement stmt = Global.databaseConnection.createStatement();
				stmt.executeUpdate(sqlVersion);
				Global.mainLogger.info("add to database version/book:"
						+ version + "/" + book);

			} catch (SQLException e) {
				Global.mainLogger.severe("Problem adding to sql");

				e.printStackTrace();
			}

		}
	}

	
/**
 * Add page to database	
 * @param pageName name of page
 * @param versionName name of version
 * @param bookName name of book
 */
	public static void SqlAddPage(String pageName, String versionName,
			String bookName) {

		String sqlPage = "INSERT INTO pages " + "VALUES ( NULL,\"" + pageName
				+ "\", \"" + versionName + "\", \"" + bookName + "\");";

		synchronized (databaseConnection) {

			try {
				Statement stmt = Global.databaseConnection.createStatement();
				stmt.executeUpdate(sqlPage);
				Global.mainLogger
						.info("add page to database [page/version/book]:"
								+ pageName + "/" + versionName + "/" + bookName);

			} catch (SQLException e) {
				Global.mainLogger.severe("Problem adding to sql");

				e.printStackTrace();
			}

		}
	}

}
