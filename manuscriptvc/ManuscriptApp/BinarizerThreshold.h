#ifndef _THRESHOLD_BINARIZER_H 
#define _THRESHOLD_BINARIZER_H 

#include "imagebinarizer.h"

class BinarizerThreshold : 	public ImageBinarizer {
	int   _threshold ;
	bool  _reverse   ;
public:
	BinarizerThreshold(int threshold){
		_threshold = threshold ;
		_reverse = false ;
	}

	BinarizerThreshold(int threshold, bool reverse){
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