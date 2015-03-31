#include "stdafx.h"
#include "GlobalBinarizer.h"
#include "DImage.h"

GlobalBinarizer::GlobalBinarizer(void){
}

GlobalBinarizer::GlobalBinarizer(float thershold){
	_thershold = thershold ;
}

GlobalBinarizer::~GlobalBinarizer(void)
{
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Binarize the image using an input threshold _thershold. </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <returns>	null if it fails, else. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////

DImage* GlobalBinarizer::binarize(){
	Mat bin_image;
	bin_image.create(_image->getMat().rows, _image->getMat().cols, CV_8U);
	cv::threshold(_image->getMat(), bin_image, _thershold,255,cv::THRESH_BINARY);
	return new DImage(bin_image) ;
}