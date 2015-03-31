#ifndef _FEATUREEXTRACTORSUM_H_ 
#define _FEATUREEXTRACTORSUM_H_  
#include "highgui.h"
#include "cv.h"
#include "FeatureExtractor.h"
#include "FeatureSum.h"
using namespace std;
using namespace cv;

class FeatureExtractorSum:public FeatureExtractor
{
	//extracts the sum of every colomn and assigns it to a vector.
public:
	FeatureExtractorSum(void);
	FeatureExtractorSum(Mat& image);
	void setImage(Mat& img);//setter for the img field in super class
	void extract(vector<Feature*>&);//extracts the average sum from each column
	~FeatureExtractorSum(void);
};

#endif