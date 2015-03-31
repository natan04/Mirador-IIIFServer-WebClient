#ifndef _GABOR_BLOB_FEATURE_H_ 
#define _GABOR_BLOB_FEATURE_H_ 

#include <opencv\cv.h>
#include <opencv\ml.h>
#include "Contour.h"
#include "feature.h"

using namespace cv ;

class FeatureGaborBlob : public Feature {
	float    _angle  ;
	float    _volume ;
	Point    _org    ;
	Point2f  _majorDirection ;
	Point2f  _minorDirection ;
	Contour  _contour ;
	Mat      _blob ;

public:
	FeatureGaborBlob(){
		_angle = 0 ;
	}

	FeatureGaborBlob(float angle){
		_angle = angle ;
	}

	~FeatureGaborBlob(){ ; }

	void setAngle(float angle){
		_angle = angle ;
	}

	float getAngle(){
		return _angle ;
	}

	void setOrg(Point org){
		_org = org ;
	}

	Point getOrg(){
		return _org ;
	}
	float getVolume(){
		return _volume ;
	}

	void setVolume(){
		_volume = (float) sum(_blob)[0];
	}

	void setContour(Contour contour){
		_contour = contour ;
	}

	Contour& getContour(){
		return _contour ;
	}
	

	void majorDirection(Point2f dir){
		_majorDirection = dir ;
	}

	Point2f majorDirection(){
		return _majorDirection ;
	}

	void minorDirection(Point2f dir){
		_minorDirection = dir ;
	}

	Point2f minorDirection(){
		return _minorDirection ;
	}

	void setBlob(Mat& mat){
		_blob = mat ;
		computeParams() ;
	}

	Mat& getBlob(){
		return _blob ;
	}

	void          sample2Row(Mat mat, int row) ;
	vector<float> vectorize() ; 
	Mat    getColorCodedBlob();
	void   setSamples(Mat& samples);
	void   computeParams();
	double distance(Feature* a);
	void   print();
};

#endif 