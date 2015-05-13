# Simple python manifest creation library

# Classes:
* Manifest - Represents the whole manifest
* Sequence - Represents page order (usually there's only one in manifest)
* Canvas - Represents canvas page
* Image - Records the physical image file properties and its IIIF url
* Maker - Factory class for the creation of manifests
* IIIFHelper - Static class with utilities (like IIIF url generator etc.)

# Typical manifest layout:
*Manifest
**	Sequence
***		Canvas (page 1)
****			Image(file & url)
***		Canvas (page 2)
****			Image(file & url)
***		Canvas (Page 3)
****			Image(file & url)
***		etc...
 
# Basic Usage (Creation from one file):
* Python:
*import manifest
*m = manifest.Maker.makeFromSingleFile("goat.jpg","Label","Description","Attribution")
*print manifest.Maker.toJSON(m)

# TO-DOs:
*Maker class - Make manifest from whole directory
*Image class - Support for TIFF/BMP and others (currently only jpeg)
*Canvas class - Calculate canvas dimensions by largest image
*Manifest class - AddMetadata setter

