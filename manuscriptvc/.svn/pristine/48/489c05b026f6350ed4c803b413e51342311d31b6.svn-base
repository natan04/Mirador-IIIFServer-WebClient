#ifndef _FEATUREEXTRACTORUPPERENVELOPE_H_  
#define _FEATUREEXTRACTORUPPERENVELOPE_H_   
#include "FeatureExtractor.h"
#include "FeatureUpperEnvelope.h"

using namespace std;
using namespace cv;
class FeatureExtractorUpperEnvelope:public FeatureExtractor
{
	//it’s main goal is to “extract” the positions of the upper envelope of a matrix (image) and assign it to a vector.
public:
	FeatureExtractorUpperEnvelope(void);
	FeatureExtractorUpperEnvelope(Mat& image);
	void setImage(Mat& img);//setter for the img field in super class
	void extract(vector<Feature*>&);//extracts the average sum from each column
	~FeatureExtractorUpperEnvelope(void);
};

#endif