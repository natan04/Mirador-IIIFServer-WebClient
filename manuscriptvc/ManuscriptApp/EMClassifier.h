#ifndef _EMClassifier_H_ 
#define _EMClassifier_H_ 

#include <opencv/ml.h>
#include "classifier.h"

using namespace cv ;

class EMClassifier : public Classifier {
	EM   _model ;
	int  _nclusters ;
	Mat  _probability ;

public:
	EMClassifier(void);
	~EMClassifier(void);

	void  setNumClusters(int n){
		_model.set("nclusters", n);
	}

	int   predict(Feature* feature, float& probability) ;
	void  train(vector<Feature*> features) ;
};

#endif 
