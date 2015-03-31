#ifndef _FEATUREEXTRACTORTRANSITION_H_  
#define _FEATUREEXTRACTORTRANSITION_H_  
#include "highgui.h"
#include "cv.h"
#include "FeatureExtractor.h"
#include "FeatureTransitions.h"

class FeatureExtractorTransition:public FeatureExtractor
{
	//this Class “Extracts” the actual transition number and assigns it to a vector.
public:
	FeatureExtractorTransition(void);
	FeatureExtractorTransition(Mat& image);
	void setImage(Mat& img);//setter for the img field in super class
	void extract(vector<Feature*>&);//extracts the average sum from each column
	~FeatureExtractorTransition(void);


};
#endif

