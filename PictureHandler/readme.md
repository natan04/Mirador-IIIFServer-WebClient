PictureHandler
=======
PictureHandler is a web application to handle connection between mirador and server.

## Picture Handler let you:
*Upload Image of manuscript directly from mirador  
*Create Json manifest on the fly
*Process images on server side.

## Servlets:

* Upload - Upload Image from client, get file and name of manuscript.
* Json - get manuscript json-iiif manifest.
* Invoker - send images processing command to third side application. 


## Configuration:
PictureHandler get servers information from web.xml 
* ImageServerAddress: IIIF server. (IE http://localhost:8080/digilib/Scaler/IIIF/)
* ImageFolder: Full path of image server.
* LogPath: Full path of Log folder.

Please make sure PictureHandler have r+w permissions!





