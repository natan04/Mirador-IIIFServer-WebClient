#ifndef _SCALAR_FEATURE_H_ 
#define _SCALAR_FEATURE_H_ 

#include <math.h>
#include "feature.h"
template <class T> 
class FeatureScalar : public Feature {
	T _val ;
public:
	FeatureScalar(){ ; }
	FeatureScalar(int a){
		_val = a ;
	}

	void val(T a){
		_val = a ;
	}

	T val(){
		return _val ;
	}

	vector<float> vectorize() {
		vector<float> array ;

		return array ;
	}

	void   sample2Row(Mat samples, int row){

	}
	double distance(Feature* a) {
		return abs(_val - ((FeatureScalar<T>*)a)->val());
	}
};

#endif 
