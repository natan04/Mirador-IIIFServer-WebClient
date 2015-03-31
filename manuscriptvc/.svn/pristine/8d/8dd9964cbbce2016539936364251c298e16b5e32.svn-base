#ifndef _TEXTLINEEXTRACTOR_H 
#define _TEXTLINEEXTRACTOR_H 

#include <opencv/cv.h>
#include <opencv2/core/core.hpp>

using namespace cv ;

class TextLine ;

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Text line extractor is a base class for text line extraction algorithms. Each 
/// 			should implement the virtual funxtion extract  </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class TextLineExtractor {
protected :
	Mat _image ;

public:
	TextLineExtractor(void)  {;}
	~TextLineExtractor(void) {;}

	void setImage(Mat img) { _image = img ;}
	virtual void extract() = 0;
};

#endif 