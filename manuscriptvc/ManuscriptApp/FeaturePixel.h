#ifndef _FEATUREPIXEL_H_ 
#define _FEATUREPIXEL_H_ 
#include <math.h>
#include "highgui.h"
#include "cv.h"
#include "Feature.h"

class FeaturePixel:public Feature
{
protected:
	CvPoint p;
public:
	FeaturePixel(void);
	FeaturePixel(int x, int y);
	int getX();//return x coordinate
	int getY();//return y coordinate
	void setX(int x);//set x coordinate
	void setY(int y);//set y coordinate
	double distance(Feature* a) ;//return real distanse if the same Feature, otherwise return INT_MAX
	void sample2Row(Mat & mat, int row);
	~FeaturePixel(void);
};
#endif
