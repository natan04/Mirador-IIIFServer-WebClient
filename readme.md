#Sources
* Manuscript library SVN - https://svn.riouxsvn.com/manuscriptvc/
* IIIF Protocol API - http://iiif.io/api/image/2.0/
* Picture Handler - https://github.com/natan04/MiradorAndIIIFServer/tree/master/PictureHandler
* Mirador Viewer (GitHub) - https://github.com/IIIF/mirador
* Digilib - https://github.com/jlerouge/digilib-pivaj
* SimpleAnnotationServer - https://github.com/natan04/MiradorAndIIIFServer/tree/master/SimpleAnnotationServer

#How it Works

**Server**

The image server contain Three Web applications:
* Pictuer Handler - Responsible for image upload, Third side application feature, and json information that compatible with IIIF.
* Digilib - Responsible for image view, compatible with IIIF.
* SimpleAnnotationServer - Responsible for annotation that made by mirador.

**Client**

The client running the mirador


#Diagram
![alt tag](https://raw.githubusercontent.com/natan04/MiradorAndIIIFServer/master/support/server%20diagram.png)
