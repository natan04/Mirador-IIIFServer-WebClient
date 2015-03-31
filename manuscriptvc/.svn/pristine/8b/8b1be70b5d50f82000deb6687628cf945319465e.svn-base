#ifndef _Classifier_H_ 
#define _Classifier_H_ 

#include <vector>
#include <opencv\cv.h> 
#include "Feature.h"
using namespace std ;

class Classifier {
public:

	Classifier(void){}
	~Classifier(void){}

	virtual int  predict(Feature* feature, float& probability) = 0 ;
	virtual void train(vector<Feature*> features) = 0 ;
};

#endif 
