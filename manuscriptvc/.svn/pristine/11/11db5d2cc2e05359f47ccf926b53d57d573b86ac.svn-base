#ifndef _FEATURELOWERENVELOPE_H_ 
#define _FEATURELOWERENVELOPE_H_ 
#include "highgui.h"
#include "cv.h"
#include "Feature.h"
#include <math.h>
using namespace std;
using namespace cv ;

class FeatureLowerEnvelope:public Feature 
{
	//It locates the “lower envelope” of a letter, and assign it to a vector.
	//sample2row creates a mapping in the original matrix (image) size and assigns pixels in the lower envelope.
protected :
	//vector<Feature*>* _low ;
	vector<float>* _low;
public:
	FeatureLowerEnvelope(void);
	FeatureLowerEnvelope(vector<float> lower);
	double distance(Feature* a);//calculates the Oclidian distance between two featur lower envelope feature
	void  sample2Row(Mat mat, int row);//assigns _avgsums to a specified row in the matrix
	vector<float> vectorize();//returns the vector
	~FeatureLowerEnvelope(void);
};
#endif
