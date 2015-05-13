import PIL
import json

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



# TODO: Canvas: height & width calculation by largest image
class Canvas:
	def __init__(self, label):
		setattr(self,"@type","sc:Canvas")
		self.label = label
		self.height = 100
		self.width = 100
		self.images = []

	def addImage(self,imgObj):
		self.images.append(imgObj)

# TODO: Support for more than jpeg files
class Image:
	def __init__(self,url="",format="image/jpeg"):
		setattr(self,"@type","dctypes:Image")
		self.format = format
		self.resource = {"@id":url}

	def initByFile(self,filename):
		print "Image class: Opening file " + filename
		im = PIL.Image.open(filename)
		print "Image class: Format: " + im.format + ", Width,Height: " + str(im.size[0]) + "," + str(im.size[1])
		self.width = im.size[0]
		self.height = im.size[1]
		self.format = Image.getMimeFormat(im.format)
		self.setUrl( IIIFHelper.buildUrl(filename) )
		im.close()

	def setUrl(self,url):
		self.resource = {"@id":url}


	@staticmethod
	def getMimeFormat(fmt):
		a = {"JPEG" : "image/jpeg"}
		if (a.has_key(fmt) == True): 
	   		return a[fmt]
	   	return ""


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

	# TODO: ManifestMaker - makeFromDirectory
	def makeFromDirectory(dirname,label,desc,attrib):
		return ""

	@staticmethod
	def toJSON(manifestObj):
		return json.dumps(manifestObj,default=(lambda o:o.__dict__),indent=4)


class IIIFHelper:
	"""Static class for different kinds of IIIF operations"""
	urlPrefix = "http://localhost/iiif/"
	
	@staticmethod
	def setPrefix(prefix):
		IIIFHelper.urlPrefix = prefix

	@staticmethod
	def buildUrl(filename,region="full",size="full",rot="0",quality="default",format="jpg"):
		return IIIFHelper.urlPrefix + filename + "/" + region + "/" + size + "/" + rot + "/" + quality + "." + format 

