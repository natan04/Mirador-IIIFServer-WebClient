#ifndef _FEATUREAVERAGESUM_H_ 
#define _FEATUREAVERAGESUM_H_ 
#include <math.h>
#include "highgui.h"
#include "cv.h"
#include "FeatureValue.h"


using namespace std;
using namespace cv ;

class FeatureAverageSum:public Feature 
{
protected :
	vector <float>* _avgsums;
public:
	FeatureAverageSum(vector<float> sums);//constructor
	double distance(Feature* a) ;//calculates the Oclidian distance between two featureaveragsum feature
	void  sample2Row(Mat mat, int row) ;//assigns _avgsums to a specified row in the matrix
	vector<float> vectorize() ;//returns the vector
	~FeatureAverageSum(void);
};

#endif