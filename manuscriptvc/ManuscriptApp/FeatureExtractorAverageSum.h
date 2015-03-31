#ifndef _FEATUREEXTRACTORAVERAGESUM_H_ 
#define _FEATUREEXTRACTORAVERAGESUM_H_ 
#include "highgui.h"
#include "cv.h"
#include "FeatureExtractor.h"
#include "FeatureAverageSum.h"

using namespace std;
using namespace cv;

class FeatureExtractorAverageSum:public FeatureExtractor
{
	//Extracts the average sum of a matrix(image).
public:
	FeatureExtractorAverageSum(void);
	FeatureExtractorAverageSum(Mat& image);
	void setImage(Mat& img);//setter for the img field in super class
	void extract(vector<Feature*>&);//extracts the average sum from each column
	~FeatureExtractorAverageSum(void);
};
#endif
