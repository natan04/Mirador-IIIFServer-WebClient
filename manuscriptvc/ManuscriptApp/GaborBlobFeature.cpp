#include "stdafx.h"
#include "ImageTools.h"
#include "GaborBlobFeature.h"

void GaborBlobFeature::setSamples(Mat& samples){
	int idx = 0 ;
	for ( int row = 0 ; row < _blob.rows; row++)
		for ( int col = 0 ; col < _blob.cols; col++ ){
			samples.at<double>(idx, 0) = row ;
			samples.at<double>(idx, 1) = col ;
			samples.at<double>(idx, 2) = _blob.at<float>(row, col) ;
			idx++ ;
		}
} 

vector<float> GaborBlobFeature::vectorize() {
	vector<float> array ;

	Point2f com =  _org + _contour.getCenter() ;
	array.push_back(_angle) ;
	array.push_back(_contour.getArea());
	array.push_back(_volume) ;
	array.push_back(com.x) ;
	array.push_back(com.y) ;
	array.push_back(_majorDirection.x) ;
	array.push_back(_majorDirection.y) ;
	array.push_back(_majorDirection.dot(_majorDirection)/_minorDirection.dot(_minorDirection));

	return array ;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Sample a feature to a mat row. </summary>
///
/// <remarks>	Jihad, 23/12/2014. </remarks>
///
/// <param name="samples">	The matrix. </param>
/// <param name="row">	The row. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

void GaborBlobFeature::sample2Row(Mat samples, int row){
	Point2f com =  _org + _contour.getCenter() ;
	samples.at<float>(row, 0) = _angle ;
	samples.at<float>(row, 1) = _contour.getArea();
	samples.at<float>(row, 2) = _volume ;
	samples.at<float>(row, 3) = com.x ;
	samples.at<float>(row, 4) = com.y ;
	samples.at<float>(row, 5) = _majorDirection.x ;
	samples.at<float>(row, 6) = _majorDirection.y ;
	samples.at<float>(row, 7) = _majorDirection.dot(_majorDirection)/_minorDirection.dot(_minorDirection) ;
}

// Fit a gussian and extract the parameters from it 
void GaborBlobFeature::computeParams(){
	int nsamples = _blob.rows * _blob.cols ;
	Mat samples(nsamples, 3, CV_64F);
	Mat cov(3,3,CV_64F);
	Mat mean(3,3,CV_64F);
	Mat value(3,3, CV_64F);
	Mat vects(3,3, CV_64F);

	setSamples(samples); 
	calcCovarMatrix(samples, cov, mean, CV_COVAR_NORMAL|CV_COVAR_ROWS);
	eigen(cov, value, vects);
	_majorDirection = Point2f((float)vects.at<double>(0,0), (float)vects.at<double>(0,1)) ;
	_minorDirection = Point2f((float)vects.at<double>(1,0), (float)vects.at<double>(1,1)) ;
	setVolume() ;
}

double GaborBlobFeature::distance(Feature* a){
	return 0 ;
}

Mat  GaborBlobFeature::getColorCodedBlob(){
	Mat hsv_img(_blob.size(), CV_32FC3);
	Vec3f  hsv_clr ;
	hsv_clr(0) = _angle ;
	hsv_clr(1) = 1.0 ;
	for ( int row = 0 ; row < hsv_img.rows ; row++ )
		for ( int col = 0 ; col < hsv_img.cols ; col ++ ){
			hsv_clr(2) = _blob.at<float>(row, col);
			hsv_img.at<Vec3f>(row, col) = hsv_clr ;
		}
	Mat rgb_img ;
	cvtColor(hsv_img, rgb_img, COLOR_HSV2RGB);
	return rgb_img ;
}

void GaborBlobFeature::print(){
	std::cout << "Angle :" << _angle << "  Vloume:" << _volume << std::endl ;
	std::cout << "Org   :" << _org << endl ;
	std::cout << "Direction: " << _majorDirection << ", " << _minorDirection << std::endl ;
	ImageTools::displayFresh("Blob ", _blob);
}

