#ifndef _IMAGE_PROJECTOR_H_ 
#define _IMAGE_PROJECTOR_H_ 

#include <opencv\cv.h>
#include "ImageOperator.h"

class DImage ;

class ImageProjector : public ImageOperator {
protected:
	int _mode ; // sum or average 
	int _direction ;
public:
	const static int MODE_SUM = 0 ;
	const static int MODE_AVG = 1 ;
	const static int MODE_MAX = 2 ;
	const static int MODE_MIN = 3 ;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Project a 2D image into 1D image (one column) </summary>
	///
	/// <remarks>	El Sana.  </remarks>
	///
	/// <param name="img">	[in] The image. </param>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	virtual DImage* project() = 0;
};

#endif 