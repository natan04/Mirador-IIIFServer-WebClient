#include "stdafx.h"
#include "BinarizerOtsuGray.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	binarize an image using the Otsu algorithm </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <returns>	null if it fails, else. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////
#include "DImage.h"


DImage* BinarizerOtsuGray::binarize(){
	Mat bin_image;
	Mat img = _image->getMat() ;
	cv::threshold(img, bin_image, 0 ,255,cv::THRESH_BINARY|cv::THRESH_OTSU);
	return new DImage(bin_image) ;
}