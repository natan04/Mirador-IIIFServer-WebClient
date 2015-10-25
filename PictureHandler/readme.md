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



