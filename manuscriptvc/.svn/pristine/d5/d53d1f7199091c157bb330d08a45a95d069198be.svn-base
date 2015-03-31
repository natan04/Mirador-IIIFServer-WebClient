#ifndef _OTSUBINARIZER_H 
#define _OTSUBINARIZER_H 

#include "ImageBinarizer.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Otsul binarizer class implements the Otsu binarization algorithm </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class BinarizerOtsu : public ImageBinarizer {
	int    _binCount ;
	float _range[2] ;
protected:
	int geOtsuThreshold(Mat  histogram);

public:
	BinarizerOtsu(){
		_binCount = 255 ;
		_range[0] = 0 ;
		_range[1] = 255 ;
	}

	BinarizerOtsu(int bins, float min, float max){
		_binCount = bins ;
		_range[0] = min ;
		_range[1] = max ;
	}
	void setBinCount(int bins){
		_binCount = bins ;
	}

	void setRange(float min, float max){
		_range[0] = min ;
		_range[1] = max ;
	}

	void setMaxRange(float max){
		_range[1] = max ;
	}

	DImage* binarize();
};


#endif