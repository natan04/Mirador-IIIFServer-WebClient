#ifndef _FEATURESUM_H_ 
#define _FEATURESUM_H_ 
#include <math.h>
#include "highgui.h"
#include "cv.h"
#include "Feature.h"

using namespace std;
using namespace cv ;

class FeatureSum:public Feature 
{
	//Counts all the cells that are above the binary threshold.
protected :
	vector<float>* _sums ;
public:
	FeatureSum(vector<float> sums);
	double distance(Feature* a);//calculates the Oclidian distance between two feature sum feature
	void  sample2Row(Mat mat, int row);//assigns _avgsums to a specified row in the matrix
	vector<float> vectorize();//returns the vector
	~FeatureSum(void);
};

#endif