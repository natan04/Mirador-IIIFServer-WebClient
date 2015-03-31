#include "stdafx.h"
#include "BinarizerThreshold.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	binarize an image based on a thershold  </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <returns>	null if it fails, else. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////
#include "DImage.h"


DImage* BinarizerThreshold::binarize(){
	Mat bin_image;
	bin_image.create(_image->getMat().size(), CV_8U);
	cv::threshold(_image->getMat(), bin_image,0 ,255,cv::THRESH_BINARY|cv::THRESH_OTSU);
	return new DImage(bin_image) ;
}