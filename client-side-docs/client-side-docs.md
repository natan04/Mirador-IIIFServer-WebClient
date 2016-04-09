The client-side is a customized version of [**Mirador**](https://github.com/IIIF/mirador), a web-based images organizer and viewer that works with [**IIIF**](http://iiif.io/technical-details/) protocol specification. The viewer component itself is an instance of [**OpenSeaDragon**](https://openseadragon.github.io/).
This custom version of Mirador has the following features:
* Custom configuration(JSON based)
* Image uploading & creation of new manuscripts/images groups (By PictureHandler component)
* Support for server-side image editing
* Annotation support (using external Open Annotation server)
* Support of multiple versions for single manifest (using an extended IIIF manifest specification)
* Batch processing of flow for all images in a manifest (thus creating new version for that manifest)
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

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-launch.jpeg)

#### Uploading / Creating new manifest on server

1. User opens Uploader form popup box.
2. User selects ID(string) from list of available manifests **OR** fills new ID in order to create new manifest on server.
3. User selects image to upload
4. POST request sent to PictureHandler upload servlet with manifest ID & image file binary chunks.
5. PictureHandler responses with **OK** (JSON Array [0, ""]), or **ERROR** (JSON Array [(error code), (error msg)]
 
![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-upload.jpeg)


#### Getting list of available functions

1. User enters into edit mode (By clicking edit button)
2. GET request to PictureHandler (Invoker service) - LIST command
3. PictureHandler responses with JSON array of functions/classes/parameters

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-function-list.jpeg)


#### Initiating edit mode (Handshake)

1. User clicks "EDIT" button on viewer
2. Edidor component initializing for current image (Setup by inner canvas ID)
3. Invoker service sends(POST) HANDSHAKE request(InvokeRequest.type = "edit") with info about manifest ID/Image ID and flow ID(if its a flow loading action)
4. Invoker responses with new temporary json manifest for future editing + session cookie is sent.
5. Edidor marks first image for editing & loading is done.

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-handshake.jpeg)


#### Invoking function on image 

1. User selects base image (from edidor bottom image list) to be the root for future edits.
2. User selects function, func class and parameter values in floating functions menu.
3. Invoker service sends(POST) normal invoke request (InvokeRequest.type = "preview") with image ID, function/class name, array of parameter values.
4. Invoker responses with new json manifest that points to the new images.
5. Edidor reinit the window with the new manifest + marks given previewed images (by index)

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-invoke.jpeg)


#### Flow saving

1. User enters flow ID / User selects flow ID from floating flow list menu (for overwriting)
2. Invoker service sends(POST) flow save invoke request (InvokeRequest.type = "save") with flow ID, image ID
3. Invoker responses with flow ID and manifest.
4. Edidor updates its view.

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-flow-save.jpeg)



#### Flow loading

1. User selects flow ID from floating flow list menu
2. Invoker service sends(POST) HANDSHAKE request with selected flow ID
3. Invoker responses with new temporary json manifest (like a normal handshake)
4. Edidor reinit its view and internals.

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-flow-load.jpeg)


#### Getting flow list

1. Invoker service sends(GET) request for flow list command URL
2. Invoker responses with json list of flow IDs

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-flow-list.jpeg)


#### Batch invoking

1. User enters batch mode (in viewer window)
2. Floating flow ID menu is loaded.
3. User selects images to processs (could be from one image to All)
4. User selects flow ID to process.
5. Invoker service sends(POST) batch request (InvokeRequest.type = "batch")  with flow ID, manifest version, image list, parent manifest ID(book id).
6. Invoker opens WebSocket connection in order to handle asynchronous workflow with Batcher server.
7. For every processed image - image index is sent to the WebSocket - progress bar is updated.
8. Batch processing is done and WebSocket is closed.
9. New manifest version is created.
10. User can exit batch mode or continue another process.

![](https://raw.githubusercontent.com/natan04/Mirador-IIIFServer-WebClient/master/client-side-docs/diagrams/jpeg/protocol-batch.jpeg)
