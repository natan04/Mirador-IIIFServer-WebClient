#ifndef _METRIC_DTW_H_ 
#define _METRIC_DTW_H_

#include <vector>
#include <opencv\cv.h>
#include <float.h>

#include "metric.h"

using namespace std ;
class ImageFeature ;

class MetricDTW : public Metric {
	cv::Mat _dist_map ;

public:
	MetricDTW(void){;}
	~MetricDTW(void){
		_dist_map.release();
	}

	void   initDistanceMap(vector<Feature*>& a, vector<Feature*>& b) ;
	double distance(Feature* a, Feature* b);
	double distance(vector<Feature*>& a, vector<Feature*>& b); 
	void   findMinimalPath(vector<cv::Point2i>& path);
	double distanceFromDiagonal(vector<cv::Point2i>& path);

	// Debug 
	void print(vector<cv::Point2i>& path);
};
#endif 
