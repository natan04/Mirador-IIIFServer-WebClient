#ifndef _FEATUREUPPERENVELOPE_H_  
#define _FEATUREUPPERENVELOPE_H_  
#include "highgui.h"
#include "cv.h"
#include "Feature.h"
#include <math.h>
using namespace std;
using namespace cv ;

class FeatureUpperEnvelope:public Feature 
{
	//It locates the “upper envelope” of a letter, and assign it to a vector. 
	//sample2row creates a mapping in the original matrix (image) size and assigns pixels in the upper envelope .
protected :
	vector<float>* _upp ;
public:
	
	FeatureUpperEnvelope(vector<float> upper);
	vector<Feature*> getUpperEnvelope();
	double distance(Feature* a);//calculates the Oclidian distance between two feature upperenvelope featre
	void  sample2Row(Mat mat, int row);//assigns _avgsums to a specified row in the matrix
	vector<float> vectorize();//returns the vector
	~FeatureUpperEnvelope(void);
};
#endif


