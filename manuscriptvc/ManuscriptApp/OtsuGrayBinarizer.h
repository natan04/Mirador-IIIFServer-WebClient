#ifndef _OTSUGRAYBINARIZER_H 
#define _OTSUGRAYBINARIZER_H 

#include "ImageBinarizer.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Otsul binarizer class implements the Otsu binarization algorithm </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class OtsuGrayBinarizer : public ImageBinarizer {

public:
	DImage* binarize();
};

#endif 