package pictureServer;

import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Comparator;
import java.util.Scanner;

import javax.imageio.ImageIO;

import org.apache.commons.fileupload.FileItem;
import org.json.JSONException;
import org.json.JSONObject;

public class Page implements Comparable<Page>, Comparator<Page> {
	public String pathOfJson;
	public String pathOfFile;
	public JSONObject json;
	public String nameOfBook;
	public String nameOfVersion;

	public String PageName;

	Page(String fileName, String bookID, String versionId) {
		PageName = fileName;
		nameOfBook = bookID;
		nameOfVersion = versionId;
		pathOfFile = Global.filePath + Global.sep + nameOfBook + Global.sep
				+ versionId + Global.sep + PageName;
	}

	// pathOfFile iiif format
	Page(String pathOfFile) {
		String[] fields = pathOfFile.split("/");

		PageName = fields[2];
		nameOfBook = fields[0];
		nameOfVersion = fields[1];
		pathOfFile = Global.filePath + Global.sep + pathOfFile;
	}

	Page(String fileName, String bookID, String versionId, String jsonPath) {

		nameOfBook = bookID;
		nameOfVersion = versionId;
		PageName = fileName;
		pathOfFile = Global.filePath + Global.sep + nameOfBook + Global.sep
				+ versionId + Global.sep + PageName;

		File picture = new File(pathOfFile);

		try {
			createJson(picture, fileName);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public int compare(Page arg0, Page arg1) {
		return arg0.PageName.compareTo(arg1.PageName);
	}

	@Override
	public int compareTo(Page arg0) {
		return this.PageName.compareTo(arg0.PageName);
	}

	// always save upload file in "default" folder inside book
	public void writePageFromUpload(FileItem fileUpdate, String fileName)
			throws Exception {

		File p = new File(Global.filePath + Global.sep + nameOfBook
				+ Global.sep + Global.defaultUploadFolder + Global.sep
				+ fileName);
		p.getParentFile().mkdirs();
		fileUpdate.write(p);
		Global.mainLogger.info("saving page: " + fileName + "\tto book: "
				+ nameOfBook);
		String f = p.getAbsolutePath();

		createJson(p, fileName);
		pathOfFile = p.getAbsolutePath();

	}

	public void createJsonFromIiifPath(File p, String iiifPath)
			throws JSONException, IOException {
		Global.mainLogger.info("adding page: " + iiifPath
				+ " in version/book: " + nameOfVersion + "//" + nameOfBook);

		String spec = "full/full/0/default.jpg";
		String idRes = Global.ImageServerAddress + iiifPath
				+ "/full/full/0/default.jpg";
		String idSer = Global.ImageServerAddress + iiifPath;
		String typeImage = "dctypes:Image";
		String typeCanvas = "sc:Canvas";
		String label = "Default label";

		BufferedImage img = null;

		Global.mainLogger.info("image read " + (p.getPath()));

		img = ImageIO.read(new File(p.getPath()));
		JSONObject firstImage = new JSONObject();
		firstImage.put("width", img.getWidth());

		firstImage.put("height", img.getHeight());

		JSONObject resource = new JSONObject();
		resource.put("@id", idRes);

		JSONObject service = new JSONObject();
		service.put("@context", Global.context);
		service.put("@id", idSer);

		resource.put("service", service);

		firstImage.put("resource", resource);

		firstImage.put("@type", typeImage);
		firstImage.put("format", "image/jpeg");

		json = new JSONObject();
		json.append("images", firstImage);

		json.put("width", img.getWidth());
		json.put("height", img.getHeight());

		json.put("@type", label);

		json.put("@id", idRes);

	}

	/**
	 * Create json from file upload
	 * @param file
	 * @param fileName
	 * @throws JSONException
	 * @throws IOException
	 */
	public void createJson(File file, String fileName) throws JSONException,
			IOException {
		Global.mainLogger.info("adding page: " + fileName
				+ " in version/book: " + nameOfVersion + "//" + nameOfBook);

		String spec = "full/full/0/default.jpg";
		String idRes = Global.ImageServerAddress + nameOfBook + "/"
				+ nameOfVersion + "/" + fileName + "/full/full/0/default.jpg";
		String idSer = Global.ImageServerAddress + nameOfBook + "/"
				+ nameOfVersion + "/" + fileName;
		String typeImage = "dctypes:Image";
		String typeCanvas = "sc:Canvas";
		String label = "Default label";

		BufferedImage img = null;

		Global.mainLogger.info("image read " + (file.getPath()));

		img = ImageIO.read(new File(file.getPath()));
		JSONObject firstImage = new JSONObject();
		firstImage.put("width", img.getWidth());

		firstImage.put("height", img.getHeight());

		JSONObject resource = new JSONObject();
		resource.put("@id", idRes);

		JSONObject service = new JSONObject();
		service.put("@context", Global.context);
		service.put("@id", idSer);

		resource.put("service", service);

		firstImage.put("resource", resource);

		firstImage.put("@type", typeImage);
		firstImage.put("format", "image/jpeg");

		json = new JSONObject();
		json.append("images", firstImage);

		json.put("width", img.getWidth());
		json.put("height", img.getHeight());

		json.put("@type", label);

		json.put("@id", idRes);

	}

	public boolean remove() {

		File jsonF = new File(pathOfJson);
		File imageF = new File(pathOfFile);
		json = null;

		boolean err = true;
		err = jsonF.delete() && imageF.delete();
		if (err)
			Global.mainLogger.info("Remove Json:" + pathOfJson
					+ "\t remove page:" + pathOfFile);
		else
			Global.mainLogger.severe("problem to remove Json:" + pathOfJson
					+ "\t and remove page:" + pathOfFile
					+ "Database may currpoted");

		return err;
	}

	public void removeRollBack() {

		if (pathOfJson != null) {
			File jsonF = new File(pathOfJson);
			if (jsonF.delete())
				Global.mainLogger.info("rollback Json:" + pathOfJson);
		}

		if (pathOfFile != null) {
			File imageF = new File(pathOfFile);
			json = null;
			if (imageF.delete())
				Global.mainLogger.info("rollback image:" + pathOfJson);
		}

	}

	public void addPageToDatabase() {
		Global.SqlAddPage(PageName, nameOfVersion, nameOfBook);
	}

	private String nameFromPath(String path) {
		if (path.lastIndexOf("\\") >= 0) {
			return path.substring(path.lastIndexOf("\\") + 1);
		} else if (path.lastIndexOf("/") >= 0) {
			return path.substring(path.lastIndexOf("/") + 1);
		} else {
			return path;
		}
	}

}
