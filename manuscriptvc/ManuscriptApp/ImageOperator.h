#ifndef _IMAGE_OPERATOR_H_ 
#define _IMAGE_OPERATOR_H_ 

#include <opencv\cv.h>

class DImage ;

class ImageOperator{
protected:
	DImage* _image ;

public:
	ImageOperator(void){;}
	ImageOperator(DImage* img){
	_image = img ;
	}
	~ImageOperator(void){;}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Sets the operated image. </summary>
	///
	/// <remarks>	El Sana.  </remarks>
	///
	/// <param name="img">	[in] The image. </param>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	void setImage(DImage* img){
		_image = img ;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Gets the operated image </summary>
	///
	/// <remarks>	El Sana. </remarks>
	///
	/// <returns>	The image. </returns>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	DImage* getImage(){
		return _image ;
	}
};

#endif 