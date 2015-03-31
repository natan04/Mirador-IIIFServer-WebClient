#ifndef _FEATURE_H_ 
#define _FEATURE_H_ 
#include <vector>
#include <opencv\cv.h> 

using namespace cv ;

class Feature {
public:
	Feature(void){;}
	~Feature(void){;}

	virtual void  sample2Row(Mat mat, int row) = 0 ;
	virtual vector<float> vectorize() = 0 ; 
	virtual double distance(Feature* a) = 0 ;
};
#endif
