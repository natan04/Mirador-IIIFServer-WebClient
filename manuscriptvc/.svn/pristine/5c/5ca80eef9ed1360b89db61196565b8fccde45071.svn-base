#ifndef _ANISOTROPIC_FILTER_ 
#define _ANISOTROPIC_FILTER_H_
#include "DImage.h"
#include "ImageFilter.h"
using namespace cv;
class FilterAnisotropic : public ImageFilter{

	protected:
		Mat findMaxResponse();
		Mat applyFilter(double* I, Size sz, double theta, double scale, double eta);
	
	public:
		Mat eraseMargins(Mat im);
		vector<double> wordSizeEstimation();
		FilterAnisotropic();
		DImage* filter();
};

#endif