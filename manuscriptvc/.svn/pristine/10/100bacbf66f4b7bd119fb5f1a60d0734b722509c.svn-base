#ifndef _THRESHOLD_BINARIZER_H 
#define _THRESHOLD_BINARIZER_H 

#include "imagebinarizer.h"

class ThresholdBinarizer : 	public ImageBinarizer {
	int   _threshold ;
	bool  _reverse   ;
public:
	ThresholdBinarizer(int threshold){
		_threshold = threshold ;
		_reverse = false ;
	}

	ThresholdBinarizer(int threshold, bool reverse ){
		_threshold = threshold ;
		_reverse = false ;
	}

	void setThreshold(int threshold){
		_threshold = threshold ;
	}

	void setReverse(bool reverse){
		_reverse = 	reverse ;
	}

	DImage* binarize();
};

#endif 