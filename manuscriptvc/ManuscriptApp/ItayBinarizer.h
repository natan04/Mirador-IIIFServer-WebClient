#ifndef _ITAYBINARIZER_H 
#define _ITAYBINARIZER_H 

#include "ImageBinarizer.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Itay binarizer class implements the Itay binarization algorithm </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class ItayBinarizer : public ImageBinarizer {
protected:

public:
	ItayBinarizer(void);
	~ItayBinarizer(void);

	DImage* binarize();
};

#endif 