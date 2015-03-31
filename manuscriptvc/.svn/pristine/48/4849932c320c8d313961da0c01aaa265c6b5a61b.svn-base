#ifndef _GABOR_BLOB_EXTRACTOR_H_ 
#define _GABOR_BLOB_EXTRACTOR_H_ 

#include <opencv\cv.h>
#include "ImageTools.h"
#include "ConnectedComponent.h" 
#include "featureextractor.h"
#include "FeatureGaborBlob.h"

class ExtractorGaborBlob : public FeatureExtractor {
	int   _numOrientation ;
	float _curOrientation ;
	Size  _kernelSize; 
	double _envelopeSigma ;
	double _wavelength ;
	double _aspectRatio ;
	vector<Mat>   _orientationList ;

public:
	ExtractorGaborBlob(){
		_numOrientation = 4 ;
		_kernelSize = Size(20,20); 
		_envelopeSigma = 20 ;
		_wavelength  = 20 ;
		_aspectRatio = 0.5 ;
	}

	ExtractorGaborBlob(int n, int r, double sigma, double lambda, double aspect_ratio){
		_numOrientation = n ;
		_kernelSize = Size(2*r, 2*r); 
		_envelopeSigma = sigma ;
		_wavelength  = lambda ;
		_aspectRatio = aspect_ratio ;
	}

	~ExtractorGaborBlob(){ ; }

	void setNumOrientation(int n ){
		_numOrientation = n ;
	}

	String getFileName(double angle){
		char buf[128] ;
		sprintf(buf, "../../Images/Results/%d_%2.2f_%2.2f_%2.2f_%2.2f_%2.1f.png", _numOrientation, _kernelSize.height, _envelopeSigma, _wavelength, _aspectRatio, angle);
		return String(buf);
	}

	Mat featureVisualizationImage(Size size, vector<Feature*>& list);
	Mat computeGaborResponse(float orientation);
	Mat extractBlobFromResponse(DImage& response, Contour& contour);
	FeatureGaborBlob* getComponentFeature(ConnectedComponent* component);
	void generateOrientationList();
	void processResponse(DImage& response, float angle, vector<Feature*>& list);

	void extract(vector<Feature*>& ) ;
};

#endif 