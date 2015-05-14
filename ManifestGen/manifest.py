import PIL.Image
import json
import os

#DONE: Support for more formats (TIFF,BMP)
#DONE: Canvas dimensions fits automatically to the biggest image
#DONE: Maker.makeFromDirectory - by parameter dirname - scans dir for supported images files and constructs manifest(1 Canvas-Image per file)
class Manifest:
	def __init__(self, label,desc,attrib):
		setattr(self,"@type","sc:Manifest")
		self.label = label
		self.description = desc
		self.attribution = attrib
		self.sequences = []

	# TODO: addMetadata
	
	def addSequence(self, seqObj):
		self.sequences.append(seqObj)



class Sequence:
	def __init__(self,label="Default Page Order"):
		setattr(self,"@type","sc:Sequence")
		self.label = label
		self.viewingDirection = "left-to-right"
		self.viewingHint = "paged"
		self.canvases = []

	def addCanvas(self,canvasObj):
		self.canvases.append(canvasObj)

	def setDirection(self,dir):
		self.viewingDirection = dir

	def setHint(self,hint):
		self.viewingHint = hint



class Canvas:
	def __init__(self, label):
		setattr(self,"@type","sc:Canvas")
		self.label = label
		self.height = 0
		self.width = 0
		self.images = []

	def addImage(self,imgObj):
		self.images.append(imgObj)
		# Check if image dimensions are bigger than canvas's and update
		if (imgObj.height > self.height):
			self.height = imgObj.height
		if (imgObj.width > self.width):
			self.width = imgObj.width

#TODO: Add "Service" property for Mirador compatibility
class Image:
	def __init__(self,url="",format="image/jpeg"):
		setattr(self,"@type","dctypes:Image")
		self.format = format
		self.resource = {"@id":url}

	#TODO: Truncate file extension when building IIIF Url
	#TODO: Remove debugging prints
	def initByFile(self,filename,path=""):
		print "Image class: Opening file " + filename
		im = PIL.Image.open(path + filename)
		print "Image class: Format: " + im.format + ", Width,Height: " + str(im.size[0]) + "," + str(im.size[1])
		self.width = im.size[0]
		self.height = im.size[1]
		self.format = Image.getMimeFormat(im.format)
		self.setUrl( IIIFHelper.buildUrl(filename) )
		im.close()

	def setUrl(self,url):
		self.resource = {"@id":url}

	#TODO: Move it to common class or utilities class
	@staticmethod
	def getMimeFormat(fmt):
		a = {"JPEG" : "image/jpeg"}
		if (a.has_key(fmt) == True): 
	   		return a[fmt]
	   	return ""

	#TODO: Move it to common class or utilities class
	@staticmethod
	def getSupportedFormats():
	 	a = {}
	 	a["JPEG"] = {"mime": "image/jpeg", "ext":"jpg"}
	 	a["BMP"] = {"mime": "image/bmp", "ext":"bmp"}
	 	a["TIFF"] = {"mime": "image/tif", "ext":"tiff"}
	 	return a

#TODO: SupportedFormats dictionary -> transform to static variable (instead of function)
	@staticmethod
	def getSupportedMimes():
		s = Image.getSupportedFormats().values()
		return [obj["mime"] for obj in s]

	#TODO: Move it to common class or utilities class
	@staticmethod
	def getSupportedExtensions():
		s = Image.getSupportedFormats().values()
		return [obj["ext"] for obj in s]
	#TODO: Move it to common class or utilities class
	@staticmethod
	def isSupported(fmt):
	 	return Image.getSupportedFormats().has_key(fmt)

	#TODO: Move it to common class or utilities class
	@staticmethod
	def isSupportedMime(mime):
		return mime in Image.getSupportedMimes()

	#TODO: Move it to common class or utilities class
	@staticmethod
	def isSupportedExtension(ext):
		return ext in Image.getSupportedExtensions()


#TODO: Transform to a package/module instead
class Maker:
	"""Factory Class for cooking manifests + utilities"""
	@staticmethod
	def makeFromSingleFile(filename,label,desc,attrib):
		man = Manifest(label,desc,attrib)
		seq = Sequence()
		canv = Canvas(label)
		im = Image()
		im.initByFile(filename)
		canv.addImage(im)
		seq.addCanvas(canv)
		man.addSequence(seq)
		return man

	#TODO: Make formatted(template) expression for every canvas  (example: "Page {Number}" or "File {Filename}")
	@staticmethod
	def makeFromDirectory(label,desc,attrib,dirname="."):
		files = Maker.listImagesFiles(dirname)
		man = Manifest(label,desc,attrib)
		seq = Sequence()

		for fname in files:
			canv = Canvas(label)
			im = Image()
			im.initByFile(fname,path=dirname)
			canv.addImage(im)
			seq.addCanvas(canv) 

		man.addSequence(seq)
		return man

	#TODO: Move it to general helpers class
	@staticmethod
	def listImagesFiles(dirname="."):
		return [fname for fname in os.listdir(dirname) if any([fname.endswith(ext) for ext in Image.getSupportedExtensions()]) ]

	#TODO: Consider move it as method for every class
	@staticmethod
	def toJSON(manifestObj):
		return json.dumps(manifestObj,default=(lambda o:o.__dict__),indent=4)

#TODO: Transform into package/module
class IIIFHelper:
	"""Static class for different kinds of IIIF operations"""
	urlPrefix = "http://localhost/iiif/"
	
	@staticmethod
	def setPrefix(prefix):
		IIIFHelper.urlPrefix = prefix

	@staticmethod
	def buildUrl(filename,region="full",size="full",rot="0",quality="default",format="jpg"):
		return IIIFHelper.urlPrefix + filename + "/" + region + "/" + size + "/" + rot + "/" + quality + "." + format 

