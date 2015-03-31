#include "stdafx.h"

#include "Feature.h"
#include "MetricDTW.h"
#include "Tools.h"

void MetricDTW::initDistanceMap(vector<Feature*>& a, vector<Feature*>& b){
	int col, row ;
	for ( col = 0; col < _dist_map.cols; col++ )
		_dist_map.at<double>(0, col) = DBL_MAX ;
	for ( row = 0; row < _dist_map.rows; row++ )
		_dist_map.at<double>(row,0 ) = DBL_MAX ;
	for ( row = 1 ; row < _dist_map.rows; row++ )
		for (col = 1 ; col < _dist_map.cols; col++ ) {
			//double cost = distance(a[row], b[col]);
			double cost = a[row]->distance(b[col]);
			double m = min(_dist_map.at<double>(row-1, col), _dist_map.at<double>(row, col-1));
			_dist_map.at<double>(row, col) = cost + min(m, _dist_map.at<double>(row-1, col-1));
		}
}

// The path is generated in reverse order 
void MetricDTW::findMinimalPath(vector<cv::Point2i>& path){
	int col = _dist_map.cols - 1 ;
	int row = _dist_map.rows - 1 ;
	path.clear() ;
	do {
		path.push_back(cv::Point2i(row, col));
		if ( col > 0 && row > 0 ){
			switch(MinIndex(_dist_map.at<double>(row-1, col), _dist_map.at<double>(row, col-1), _dist_map.at<double>(row-1, col-1))){
			case 0 :
				 row -- ;
				break ;
			case 1:
				col-- ;
				break;
			default:
				col-- ;
				row-- ;
			}
		}
		else {
			if ( col > 0 )
				col-- ;
			if ( row > 0 )
				row -- ;
		}
	} while (col > 0 && row > 0 );
}

double  MetricDTW::distanceFromDiagonal(vector<cv::Point2i>& path){
	double sum = 0 ;
	int pidx = (int)path.size() - 1 ; 
	for ( int row = 0  ; row < _dist_map.rows ; row++ ){
		while ( pidx > 0 && path[pidx].y == path[pidx-1].y )
			pidx -- ;
		sum += abs(path[pidx].y - path[pidx].x) ;
	}
	return sum ;
}

double  MetricDTW::distance(Feature* a, Feature* b){
		return a->distance(b) ;
}

double MetricDTW::distance(vector<Feature*>& a, vector<Feature*>& b){
	vector<cv::Point2i> path ;
	_dist_map.create((int)a.size(), (int)b.size(), CV_64F);
	initDistanceMap(a,b);
	findMinimalPath(path) ;
	print(path);
	return distanceFromDiagonal(path);
}

// Debug 
void MetricDTW::print(vector<cv::Point2i>& path){
	cout << "Path [" << path.size() << "]" << endl ;
	for (int i = 0 ; i < path.size(); i++ )
		cout << path[i] << endl ;
}


