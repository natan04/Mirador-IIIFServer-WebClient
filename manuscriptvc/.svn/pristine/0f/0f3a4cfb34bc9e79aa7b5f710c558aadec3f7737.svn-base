
#include "stdafx.h"
#include "DImage.h"


DImage*  DImage::convert(int to_type){
	cv::Mat gray ;
	if ( _mat.type() == to_type )
		return this ;

	if ( _mat.channels() == 1 ){
		_mat.convertTo(gray, CV_8U);
		return new DImage(gray);
	}

	if ( _mat.channels() == 3 && to_type == CV_8U) {
		cv::Mat gray ;
		cvtColor(_mat, gray, CV_BGR2GRAY);
		return new DImage(gray);
	}
	return this ;

}

Point2f DImage::setCOM(){
	_com.x = 0 ;
	_com.y = 0 ;
	float npixels = (float)(_mat.cols * _mat.rows) ;
	for ( int col = 0 ; col < _mat.cols ; col++ )
		for ( int row = 1 ; row < _mat.rows ; row++ ){
			float g = (float)(_mat.at<char>(row, col)) ;
			_com.x += col * g ;
			_com.y += row * g ;
		}
	_com.x /= npixels * 255.0f ;
	_com.y /= npixels * 255.0f ;
	return _com ;
}