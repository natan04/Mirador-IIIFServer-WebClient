#ifndef _FEATUREEXTRACTORLOWERENVELOPE_H_ 
#define _FEATUREEXTRACTORLOWERENVELOPE_H_ 
#include "FeatureExtractor.h"
#include "FeatureLowerEnvelope.h"
using namespace std;
using namespace cv;

class FeatureExtractorLowerEnvelope:public FeatureExtractor
{
	//It’s main goal is to “extract” the positions of the lower envelope of a matrix (image) and assign it to a vector.
public:
	FeatureExtractorLowerEnvelope(void);
	FeatureExtractorLowerEnvelope(Mat& image);
	void setImage(Mat& img);//setter for the img field in super class
	void extract(vector<Feature*>&);//extracts the average sum from each column
	~FeatureExtractorLowerEnvelope(void);

};
#endif
