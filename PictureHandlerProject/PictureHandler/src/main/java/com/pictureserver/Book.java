package com.pictureserver;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicInteger;

import javax.imageio.ImageIO;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Book implements Comparable<Book>, Comparator<Book> {

	public ArrayList<Version> gVersions; 					// list of VERSION object
	JSONObject versionsJson;								// Json version object (default, and others)
	String gBookId = null;									//	book id
	AtomicInteger versionIndex = new AtomicInteger(0);		// index of version. usable for sort by mirador


	/**
	 * @return book id.
	 */
	String getId() {
		return gBookId;
	}

/**
 * Construct book object only by book id. usefull for search by object.
 * @param bookid
 */
	Book(String bookid) {
		gBookId = bookid;
	}

	
	/**
	 * Construct book by params
	 * @param bookid name of book
	 * @param restore do we need to create the book from sql?
	 * @param addToDatabase do we need to add the book to sql?
	 */
	Book(String bookid, boolean restore, boolean addToDatabase) {

		//init:
		versionsJson 	= new JSONObject();			
		gVersions 		= new ArrayList<Version>();
		gBookId 		= bookid;

		/*
		 * Restore from sql
		 */
		if (restore) 
			restoreBookFromSql(bookid);

		else {

			createNewBook(bookid, addToDatabase);

		}

	}

	
/**
 * Create new book 
 * @param bookid id of book
 * @param addToDatabase tell if need insert it to sql database
 */
	public void createNewBook(String bookid, boolean addToDatabase) {
		Global.mainLogger.info("creating book: " + bookid);

		// creating first default folder.
		Version ver = new Version(bookid, Global.defaultUploadFolder, false);

		try {
			JSONObject indexIIIf = new JSONObject();

			indexIIIf.put("index", versionIndex.getAndIncrement());
			indexIIIf.put("IIIF", ver.all);
			versionsJson.put(Global.defaultUploadFolder, indexIIIf);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		gVersions.add(ver);

		if (addToDatabase)
			ver.addToSql();
	}

	/**
	 * Restore book from sql
	 * @param bookid name of book
	 */
	public void restoreBookFromSql(String bookid) {
		Global.mainLogger.info("Restoreing book: " + gBookId);

		ResultSet rs = Global.sqlVersionsOfBook(bookid);
		try {
			while (rs.next()) {

				String nameOfVersion = rs.getString("version_name");
				Version ver = new Version(gBookId, nameOfVersion, true);

				int found = Collections.binarySearch(gVersions, ver);
				gVersions.add(-found - 1, ver); // keeping the sorted array

				JSONObject indexIIIf = new JSONObject();

				indexIIIf.put("index", versionIndex.getAndIncrement());
				indexIIIf.put("IIIF", ver.all);
				versionsJson.put(nameOfVersion, indexIIIf);

			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * Add the book details to sql
	 */
	void addBookToDatabase() {
		Global.SqlAddBook(gBookId);

	}


	/**
	 * Return Json style manifest.
	 */
	public String toString() {

		try {
			return versionsJson.toString(4);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "problem";
	}

	@Override
	public int compareTo(Book o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	public int compare(Book o1, Book o2) {
		// TODO Auto-generated method stub
		return o1.getId().compareTo(o2.getId());
	}

	/**
	 * @param idVersion
	 *            version id
	 * @return the corresponding id version to id of version
	 */
	public Version getVersion(String idVersion) {
		Version search = new Version(idVersion);
		int found = Collections.binarySearch(gVersions, search);
		if (found < 0) {
			Version newVersion = new Version(gBookId, idVersion, false);
			gVersions.add(-found - 1, newVersion); // keeping the array sorted

			Global.mainLogger.info("creating version: Book/Version: " + gBookId
					+ "/" + idVersion);

			try {
				JSONObject indexIIIf = new JSONObject();

				indexIIIf.put("index", versionIndex.getAndIncrement());
				indexIIIf.put("IIIF", newVersion.all);
				versionsJson.put(idVersion, indexIIIf);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			return newVersion;
		}

		else
			return gVersions.get(found);

	}

	/**
	 * Return new version. Remove previous version if exists.
	 * 
	 * @param idVersion
	 *            id name
	 * @return a new version
	 */
	public Version getNewVersion(String idVersion) {
		Version search = new Version(idVersion);
		int found = Collections.binarySearch(gVersions, search);
		if (found >= 0) {
			gVersions.remove(found);

		}

		return getVersion(idVersion);

	}

	/**
	 * Get the upload version
	 * 
	 * @return default upload version
	 */
	public Version getDefaultVersion() {

		Version search = new Version(Global.defaultUploadFolder);

		int found = Collections.binarySearch(gVersions, search);
		if (found < 0) {

			Global.mainLogger.severe("Problem return base version of book: "
					+ gBookId);
			return null;
		}

		else
			return gVersions.get(found);

	}
}