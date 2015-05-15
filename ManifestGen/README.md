# Simple python manifest creation library

# Classes:
* Manifest - Represents the whole manifest
* Sequence - Represents page order (usually there's only one in manifest)
* Canvas - Represents canvas page
* Image - Records the physical image file properties and its IIIF url
* Maker - Factory class for the creation of manifests
* IIIFHelper - Static class with utilities (like IIIF url generator etc.)

# Typical manifest layout:
* Manifest
  * Sequence
    * Canvas (page 1)
      * Image(file & url)
    * Canvas (page 2)
      * Image(file & url)
    * Canvas (Page 3)
      * Image(file & url)
    * etc...
 
# Basic Usage (Creation from one file):
* Python:
* `import manifest`
* `m = manifest.Maker.makeFromSingleFile("goat.jpg","Label","Description","Attribution")`
* `print manifest.Maker.toJSON(m)`

# Advanced Usage (From multiple files in a given directory):
* Python:
* `import manifest`
* `m = manifest.Maker.makeFromDirectory("Label","Description","Attribution",dirname="/GoatsImages/")`
* `print manifest.Maker.toJSON(m)`
* This should iterate thru all the supported files(TIFF,JPEG,BMP) in the directory and create
* Manifest with multiple pages(Canvases) - One canvas/page per file

# Simple Command Line tool:
* Synopsys: python manifest.py <OPTIONS>
* Options:
  * **-o Output File**    - Output JSON file **(if no -o then it prints the output)**
  * **-d Directory Name** - Scans entire directory for multiple images manifest
  * **-f File name**      - Single image file manifest

* Examples: 
  * python manifest.py -o manifest.json -d /Users/Goats/Images
  * python manifest.py -o manifest.json -f /Images/Goat.jpg

> URL Prefix: Currently there's hard coded URL Prefix. will be customized in the future

> Label/Description/Attribution properties: Currently only default values. will be customized in the future


# TO-DOs:
* CommandLine - option to customize URL Prefix(currently hard-coded), Description, Label, Attribution manifest parameters
* Manifest class - AddMetadata setter
* Maker class + IIIFHelper class - transform into packages/modules
* Image class static methods for supported formats - move into Utility or Formats module
* Maker.makeFromDirectory - consider give an option to auto label(template) all the pages, for example: "Page {Number}"
* Image class - when building IIIF urls - truncate file extension
* _DONE_ CommandLine Utility
* Check for option to integrate with apache as web service (WSGI / mod_python)

# Changes 15/5/15
* Simple Command Line utility for creation of manifests from single file or from directory.
* Maker.toFile function - writes JSON to file(filename). prints if filename == ""
* Added compatibilty for Mirador (tested with a few images)

# Changes 14/5/15
* Support for multiple formats (currently JPEG, TIFF, BMP) - Managed by special list - Image.getSupportedFormats()
* Canvas dimensions automatically fit to its Image's dimensions
* Added method - Maker.makeFromDirectory

