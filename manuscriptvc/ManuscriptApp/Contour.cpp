#include "stdafx.h"
#include "Contour.h"


void Contour::setCenter() {
	_center.x = 0 ;
	_center.y = 0 ;
	vector<Point>::iterator iter ;
	for ( iter = _points.begin() ; iter != _points.end(); iter++ ){
		_center.x += (*iter).x ;
		_center.y += (*iter).y ;
	}
	_center.x /= _points.size() ;
	_center.y /= _points.size() ;
}

Mat Contour::getMat(vector<Point>& pts){
	Mat m((int)(pts.size()), 2, CV_64F);
	vector<Point>::iterator iter ;
	int row = 0 ;
	for (iter = pts.begin() ; iter != pts.end(); iter++, row++ ){
		m.at<double>(row, 0) = (*iter).x ;
		m.at<double>(row, 1) = (*iter).y ;
	}
	return m ;
}


void Contour::setOrientation(){
	// Copy points to mat ;
	Mat pts = getMat(_points);
	Mat cov(2,2,CV_64F);
	Mat mean(2,2,CV_64F);
	Mat value(2,2, CV_64F);
	Mat vects(2,2, CV_64F);
	calcCovarMatrix(pts, cov, mean, CV_COVAR_NORMAL|CV_COVAR_ROWS);
	eigen(cov, value, vects);
	_orientation.first  = Point2f(vects.at<float>(0,0), vects.at<float>(0,1)) ;
	_orientation.second = Point2f(vects.at<float>(1,0), vects.at<float>(1,1)) ;
	
	//_orientation.first  = Point2d(vects.at<double>(0,0), vects.at<double>(0,1)) * sqrt(value.at<double>(0,0));
	//_orientation.second = Point2d(vects.at<double>(1,0), vects.at<double>(1,1)) * sqrt(value.at<double>(1,0));
	//cout << "First: "<< _orientation.first << "  Second: " << _orientation.second << endl ;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Sets the bounding rectangle of the contour, using its points. </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

void Contour::setBoundRect(){
	vector<Point>::iterator iter = _points.begin() ;
	Point min = (*iter) ;
	Point max = (*iter) ;
	while ( iter != _points.end() ){
		if ( (*iter).x < min.x )
			min.x = (*iter).x ;

		if ( (*iter).x  > max.x )
			max.x = (*iter).x ;

		if ( (*iter).y < min.y )
			min.y = (*iter).y ;

		if ( (*iter).y  > max.y )
			max.y = (*iter).y ;
		iter++ ;
	}
	_brect.x = min.x ;
	_brect.y = min.y ;
	_brect.height = max.y - min.y + 1;
	_brect.width  = max.x - min.x + 1;
}

Contour Contour::translateToOrigin(){
	Point shift(-_brect.x, -_brect.y);
	return translate(shift);
}


Contour Contour::translate(Point shift){
	Contour ret_contour ;
	Point   point ;
	for ( vector<Point>::iterator iter = _points.begin(); iter != _points.end(); iter++ ){
		point = *iter + shift ;
		ret_contour._points.push_back(point);
	}
	ret_contour._brect = _brect ;
	ret_contour._brect.x += shift.x ;
	ret_contour._brect.y += shift.y ;
	ret_contour._center.x += float(shift.x) ;
	ret_contour._center.y += float(shift.y) ;
	ret_contour._orientation = _orientation ;
	return ret_contour ;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Gets the area of a contour, the area is computed each time it is called, i.e., it is
/// 			not stored  </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <returns>	The area. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////

float Contour::getArea(){
	Point p ;
	p.x = _brect.x + _brect.width/2 ;
	p.y = _brect.y + _brect.height/2 ;
	Point u, v ;
	float area = 0 ;
	for ( unsigned int i = 0 ; i < _points.size() - 1; i++ ){
		u = _points[i] - p  ;
		v = _points[i+1] - p ;
		area += u.x * v.y - u.y * v.x ;
	}
	u = _points[_points.size()-1] - p  ;
	v = _points[0] - p ;
	area += u.x * v.y - u.y * v.x ;

	return area ;
}

Mat Contour::getMask(){
	vector<vector<Point>> contour_list  ;
	Contour translated_contour = this->translateToOrigin();
	contour_list.push_back(translated_contour.getPoints());
	Mat mask = Mat::zeros(translated_contour.getBoundRect().size(), CV_8U);
	drawContours(mask, contour_list, 0, Scalar(255), CV_FILLED);
	return mask ;
}


void Contour::drawOnImage(Mat mat, char value){
	vector<Point>::iterator iter = _points.begin() ;
	while ( iter != _points.end() ){
		cout << *iter <<", " ;
		mat.at<char>(*iter) = value ;
		iter++ ;
	}

}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Gets an importance, which is computed as the size of the thriangle defined by the 
/// 			vertex and its two adjacent neighbors </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <param name="i">	Zero-based index of the. </param>
///
/// <returns>	The importance. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////

float Contour::getImportance(int i){
	cv::Point vp = _points[i-1] - _points[i]  ;
	cv::Point vn = _points[i+1] - _points[i] ;

	
	return (float)abs(vp.x * vn.y - vp.y * vn.x );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Return the vertex with the least importance value </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <returns>	The least important. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////

int Contour::getLeastImportant(){
	int   min_idx = 0 ;
	float min_val = getImportance(0) ;
	for (unsigned int i = 1 ; i < _points.size() ; i++ ){
		float val = getImportance(i) ;
		if ( val < min_val ){
			min_idx = i ;
			min_val = val ;
		}
	}
	return min_idx ;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Removes the vertex i from the contour (boundary). </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <param name="i">	Zero-based index of the. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

void Contour::removeVertex(int i){
	_points.erase(_points.begin() + i);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Removes the vertex with least importance value </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
///
/// <returns>	. </returns>
////////////////////////////////////////////////////////////////////////////////////////////////////

int Contour::removeLeastImportant(){
	int vert_idx = getLeastImportant();
	_points.erase(_points.begin() + vert_idx);
	return vert_idx ;
}


void Contour::print(){
	cout << "Bound Rect: " << _brect << endl ;
	for ( vector<Point>::iterator iter = _points.begin(); iter != _points.end(); iter++ ){
		cout << *iter << ", " ;
	}
	cout << endl ;
}
