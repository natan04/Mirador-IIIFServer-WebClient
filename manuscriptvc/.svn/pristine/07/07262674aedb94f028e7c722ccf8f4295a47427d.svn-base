#ifndef _FEATUREVALUE_H_  
#define _FEATUREVALUE_H_ 
#include <math.h>
#include "Feature.h"
#include "highgui.h"
#include "cv.h"

using namespace cv;
using namespace std;

class FeatureValue:public Feature
{
	//It is main purpose is to hold 1 value. we will use it to evaluate sum, transitions and etc.
protected:
	double _val;
public:
	FeatureValue(void);
	FeatureValue(double);
	void SetVal(double);
	double getVal(void);
	double distance(Feature* a);
	void sample2Row(Mat & mat, int row);
	~FeatureValue(void);
};

#endif