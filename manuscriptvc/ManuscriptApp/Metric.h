#ifndef _METRIC_H_ 
#define _METRIC_H_
#include <vector>
#include "Feature.h"
using namespace std ;

class Metric {
public:
	Metric(void){};
	~Metric(void){;}

	virtual double distance(Feature* a, Feature* b) = 0 ;
	virtual double distance(vector<Feature*>& a, vector<Feature*>& b) = 0 ;
};

#endif 