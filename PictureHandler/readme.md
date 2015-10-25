PictureHandler
=======
PictureHandler is a web application to handle connection between mirador and iiif server. 

## With PictureHandler you can:
* Upload Image of manuscripts directly from mirador  
* Use Auto-generated Json-iiif-manifest of Manuscript
* Process images on server side with third side application.

## Servlets:

* Upload - Upload Image from client, get file and name of manuscript.
* Json - get manuscript json-iiif manifest.
* Invoker - send images processing command to third side application. 


## Configuration:
PictureHandler get servers information from web.xml 
* ImageServerAddress: IIIF server. (IE: http://localhost:8080/digilib/Scaler/IIIF/)
* ImageFolder: Full path of image folder to store images.
* LogPath: Full path of Log folder.

Please make sure PictureHandler have R+W permissions!

## Third side application:
Any Third side application that want to integrate with Picture handler for further processing **MUST** able to received Json object as follow:
```html
{
    "Function": "<Function Name>",
    "Class": "<Class Name>",
    "Parameters": [<Array of parameter JSON objects>]
    "Input": "<Input File Path>"
    "Output": "<Output File Path>"
}
```


**Data Structure**

The data are stored in hierarchical order: Book -> Version -> Page.

Data are also save on SQL database for easily restore after showdown.
  
![alt tag](https://raw.githubusercontent.com/natan04/MiradorAndIIIFServer/master/support/datastructurePictureHandler.PNG)

**Storage**

Images are store on "ImageFolder" folder in format of:  IMAGE_FOLDER/Book/Version/Page

SQL Picture database are stored in: IMAGE_FOLDER/Picture.db

Temp folder For preview invoking are located at: IMAGE_FOLDER/temp



**Servlets:**

* Json: displaying IIIF information that compatible with Mirador. Working by GET request.

* Upload: Uploading image, and create Json accordantly.

* Invoker: Previewing image cmmnd by calling the third side application, and create the image inside temp folder, and update the preview book.

* Batcher: Web socket for running Batch command by third side application, and feed progress information to Mirador.
 

