# 1.Git clone
Clone the full git repository:
```bash
git clone https://github.com/natan04/Mirador-IIIFServer-WebClient
```
Into directory of your choice


# 2.Configure build


The main build and deployment config file is **imagesrv.properties**

Before building & running - you should make sure that **imagesrv.properties** file reflects your environment settings.

The file has the following properties:

| Property name | Description | Default (in imagesrv)     |
| ------------- | ----------- | ------------------------- |
| app.server.type | server container type |  **tomcat8x** |
| app.server.port | server container port |  **8080** |
| picturehandler.log.path  | PictureHandler full log path |  **/root/PictureHandler/logs/handler.log** |
| picturehandler.exe.path | PictureHandler Invoke module path |  **/root/PictureHandler/BW.jar** |
| picturehandler.funcs.json | functions description JSON file path - |  **/root/PictureHandler/functions_dummy.json** |
| picturehandler.digilib.url | digilib server full URL |  **http://(imagesrv ip):8080/digilib/Scaler/IIIF/** |
| images.folder | PictureHandler images local storage path |  **/root/PictureHandler/images-store** |
| mirador.anno.url | Mirador annotation Server full URL |  **http://(imagesrv ip):7080/annotation** |
| mirador.picturehandler.base | PictureHandler base URL |  **http://(imagesrv ip):8080** |
| mirador.invoker.base | PictureHandler Invoker service base URL |  **http://(imagesrv ip):8080** |
| mirador.batcher.url | PictureHandler Batcher service base URL |  **ws://(imagesrv ip):8080/PictureHandler/Batcher** |
| mirador.services.timeout | Mirador timeout for services requests(in ms) |  **9000** |
| digilib.log.path | digilib server log file path |  **/root/PictureHandler/logs/digilib.log** |
| digilib.log.level | digilib server logging level |  **debug** |
| anno.server.store.path | Annotation server local storage path |  **/root/PictureHandler/annotation-store/** |



# 3.Building & Starting server bundle

**Before starting** - make sure that **ALL** server directories/files are exist according to your defined properties in the previous step (images folder, logs folder, annotation store path, functions JSON)


Build & start all components by running the following shell commands **inside your repository cloned directory**:

```bash
mvn clean install
```

This should do the following:
* Clean all previously built artifacts
* Build & Package **digilib server**
* Build & Package **PictureHandler services**
* Build & Package **Mirador client app**
* Deploy all 3 main components and start server container (default: tomcat 8)

# 4.Building & starting annotation server
The Annotation server that comes with the project is using another container (**Jetty server**) so it should be started manually **after** the start of the 3 main components (previous step)

```bash
cd <your cloned git repository path>
cd SimpleAnnotationServer
mvn clean jetty:run-war
```

This should build & start SimpleAnnotationServer

# 5.Running Mirador client
The client can be reached by browsing to the following URL:

**http://(imagesrv ip)):8080/mirador/**