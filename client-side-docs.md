The client-side is a customized version of ****Mirador, a web-based images organizer and viewer that works with ****IIIF protocol specification. The viewer component itself is an instance of ****OpenSeaDragon.
This custom version of Mirador has the following features:
* Custom configuration(JSON based)
* Image uploading & creation of new manuscripts/images groups (By PictureHandler component)
* Support for server-side image editing
* Annotation support (using external Open Annotation server)
* Support of multiple versions for single manifest (using an extended IIIF manifest specification)

# Classes and components
The following list consists of the new extensions only. For core-mirador components documentation please see Mirador's repository.
* miradorLauncher - global component to launch Mirador with custom JSON based config.
* serviceManager - global container object which keeps track of all services(PictureHandler, Invoker, etc.) and their config.
* Uploader - widget which adds uploader form popup & dynamic combobox to choose updated manifest that exists on server. 
* Invoker

# Protocol description
