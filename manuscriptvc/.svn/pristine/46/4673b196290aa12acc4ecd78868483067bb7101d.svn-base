#ifndef _INT_FEATURE_H_ 
#define _INT_FEATURE_H_ 

#include <math.h>
#include "feature.h"

class FeatureInt : public Feature {
	int _val ;
public:
	FeatureInt(){ ; }
	FeatureInt(int a){
		_val = a ;
	}

	void val(int a){
		_val = a ;
	}

	int val(){
		return _val ;
	}

	double distance(Feature* a) {
		return abs(_val - ((FeatureInt&)a).val());
	}
};

#endif 
