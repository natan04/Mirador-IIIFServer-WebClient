#ifndef _FEATURE_EXTRACTOR_H 
#define _FEATURE_EXTRACTOR_H 

#include <opencv/cv.h>
#include <opencv2/core/core.hpp>
#include "Feature.h"

using namespace cv ;

class FeatureExtractor {
protected:
	Mat _image ;

public:
	FeatureExtractor(void){;}
	FeatureExtractor(Mat& img){
		_image = img ;
	}
	~FeatureExtractor(void){;}

	void setImage(Mat& img) { _image = img ;}
	void extract(Mat& img, vector<Feature*>& list){
		_image = img ;
		extract(list) ; 
	}

	virtual void extract(vector<Feature*>& ) = 0;
	
};

#endif
