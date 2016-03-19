The client-side is a customized version of [**Mirador**](https://github.com/IIIF/mirador), a web-based images organizer and viewer that works with [**IIIF**](http://iiif.io/technical-details/) protocol specification. The viewer component itself is an instance of [**OpenSeaDragon**](https://openseadragon.github.io/).
This custom version of Mirador has the following features:
* Custom configuration(JSON based)
* Image uploading & creation of new manuscripts/images groups (By PictureHandler component)
* Support for server-side image editing
* Annotation support (using external Open Annotation server)
* Support of multiple versions for single manifest (using an extended IIIF manifest specification)
***

# Classes and components
The following list consists of the new extensions only. For core-mirador components documentation please see [Mirador's repository](https://github.com/IIIF/mirador).
* miradorLauncher - global component to launch Mirador with custom JSON based config.
* serviceManager - global container object which keeps track of all services(PictureHandler, Invoker, etc.) and their config.
* Uploader - widget which adds uploader form popup & dynamic combobox to choose updated manifest that exists on server. 
* Invoker Library - This component is responsible for the whole editing protocol management + views for representation of function/class/paraemters when invoking.
* Edidor - Responsible for the whole editing views and logic

***

# Function/Class/Parameter model

***

# Protocol description

#### On launch

1. Mirador request for custom JSON config file
2. Parsing config & resolving URLs for services (Using ServiceManager)
3. GET Request is sent to PictureHandler to fetch manifests list
4. PictureHandler responses with manifest list 
5. Mirador populates inner manifest lists for future loading (late AJAX)
6. Mirador viewer & workspace is loaded.

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/protocol-launch.jpeg)

#### Uploading / Creating new manifest on server

1. User opens Uploader form popup box.
2. User selects ID(string) from list of available manifests **OR** fills new ID in order to create new manifest on server.
3. User selects image to upload
4. POST request sent to PictureHandler upload servlet with manifest ID & image file binary chunks.
5. PictureHandler responses with **OK** (JSON Array [0, ""]), or **ERROR** (JSON Array [(error code), (error msg)]
 
![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/protocol-upload.jpeg)


#### Getting list of available functions

1. User enters into edit mode (By clicking edit button)
2. GET request to PictureHandler (Invoker service) - LIST command
3. PictureHandler responses with JSON array of functions/classes/parameters

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/protocol-function-list.jpeg)


#### Initiating editing mode (Handshake)

#### Invoking function on image

#### Flow saving

#### Flow loading

#### Getting flow list

#### Batch invoking