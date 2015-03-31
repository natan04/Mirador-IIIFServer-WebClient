#include "stdafx.h"
#include "ProjectionProfile.h"
#include "DImage.h"
using namespace cv ;
//===========================================================================================================================================
// Description: This function preforms two key transformation on the given sample: first it rotates the sample at a given angle, and second
// it determines which type of reduction to preform on the sample: Sum, Average, etc.
// Each transformation accepts parameters that are passed through the Projection Profile constructor (or default values.).
// Returns: A DImage instance holding the image projection.
//============================================================================================================================================
DImage* ProjectionProfile::project() {
	Mat mat ;
	Mat org_mat = _image->getMat() ;
	switch (_direction){
	case 0:
		mat.create(org_mat.size(), CV_8U);
		_image->getMat().copyTo(mat);
		break ;

	case  90 :
	case -90 :
		mat.create(org_mat.cols, org_mat.rows, CV_8U);
		cv::transpose(_image->getMat(), mat);
		break ;

	default:
		mat.create(org_mat.cols, org_mat.rows, CV_8U);
		Mat rot_mat = cv::getRotationMatrix2D(cv::Point2f(org_mat.cols/2.0f, org_mat.rows/2.0f), _direction, 1);
		warpAffine(org_mat, mat, rot_mat, Size(org_mat.cols, org_mat.rows))	;
	}

	Mat proj_mat(mat.cols, 1, CV_32F);
	// Determine which type of reduction to preform on the document : Sum, Average, etc..
	switch(_mode){
	case MODE_SUM:
		cv::reduce(mat, proj_mat, 1, CV_REDUCE_SUM, CV_32F);
		break ;

	case MODE_AVG:
		cv::reduce(mat, proj_mat, 1, CV_REDUCE_AVG, CV_32F);
		break ;

	case MODE_MAX:
		cv::reduce(mat, proj_mat, 1, CV_REDUCE_MAX, CV_32F);
		break ;

	case MODE_MIN:
		cv::reduce(mat, proj_mat, 1, CV_REDUCE_MIN);
		break ;

	default:
		cv::reduce(_image->getMat(), proj_mat, 1, CV_REDUCE_SUM);
	}
	return new DImage(proj_mat) ;
}

double ProjectionProfile::getProfileSum(DImage* profile){
	double sum = 0 ;
	Mat mat = profile->getMat() ;
	for ( int i = 0 ; i < mat.rows ; i++ ){
		sum += mat.at<float>(i,0) ;
	}
	return sum ;
}

void ProjectionProfile::drawProfile(DImage* img, DImage* profile, int width ){
	double  min, max ;
	Point2i start(0,0);
	Point2i end(0, img->getMat().cols - 1);
	Mat prf = profile->getMat() ;
	Mat mat  = img->getMat() ;

	minMaxLoc(prf, &min, &max);
	float   norm = (float)(width/ max) ;
	for ( int i = 0 ; i < prf.rows ; i++ ){
		start.x = mat.cols - 1;
		start.y = i ;
		end.x = mat.cols-1 - (int)(norm * prf.at<float>(i, 0));
		end.y = i ;
		line(mat, start, end, 0);
	}
}

//=======================================================================================================================
//Description: This function populates a vector to hold the Peaks and Valleys as Pairs: 
//The first coordinate is a Point2i holding the (x,y) position and the second coordinate holds true or false (True = Peak, False = Valley).
//
//Returns: A vector that hold the Minimum and Maximum points on the projection profile.
//================================================================================================================================
std::vector<std::pair<Point2i, bool>> ProjectionProfile::findMinimumMaximum(DImage* profile) {
	const int DELTA = 0;
	Mat mat = profile->getMat();
	std::vector<std::pair<Point2i,bool>> array;

	//END CASES
	if (mat.at<float>(0, 0) - mat.at<float>(1, 0) > DELTA)
		array.insert(array.end(), std::make_pair(Point2i(0,(int)mat.at<int>(0,0)),true));
	else if (mat.at<float>(1, 0) - mat.at<float>(0, 0) > DELTA)
		array.insert(array.end(), std::make_pair(Point2i(0, (int)mat.at<float>(0, 0)), false));

	for (int i = 1; i < mat.rows-1; i++) {
		if ( mat.at<float>(i, 0) - mat.at<float>(i - 1, 0) > DELTA && mat.at<float>(i, 0) - mat.at<float>(i + 1, 0) > DELTA)
			array.insert(array.end(), std::make_pair(Point2i(i,(int) mat.at<float>(i, 0)), true));
		else if (mat.at<float>(i-1, 0) - mat.at<float>(i, 0)>DELTA && mat.at<float>(i+1, 0) - mat.at<float>(i, 0)>DELTA)
			array.insert(array.end(), std::make_pair(Point2i(i, (int)mat.at<float>(i, 0)), false));
	}

	//END CASES
	if (mat.at<float>(mat.rows - 1, 0) - mat.at<float>(mat.rows - 2, 0) > DELTA)
		array.insert(array.end(), std::make_pair(Point2i(mat.rows-1,(int) mat.at<float>(mat.rows - 1, 0)), true));
	else if (mat.at<float>(mat.rows - 2, 0) - mat.at<float>(mat.rows - 1, 0) > DELTA)
		array.insert(array.end(), std::make_pair(Point2i(mat.rows-1,(int) mat.at<float>(mat.rows - 1, 0)), false));

	return array;
}

//=========================================================================================================================
//Description: This function implements the Auto-Alignment Algorithem and returns a double to represent the "Weight" of the projection.
//IMPORTANT: The number of peaks is corresponding to the number of valleys.
//=========================================================================================================================

double ProjectionProfile::getPeakValleySum(DImage* profile) {
	double sum = 0;
	std::vector<std::pair<Point2i,bool>> array = findMinimumMaximum(profile);
	
	for (int i = 1; i < (int)array.size() - 1; i++) {
		if (array[i].second == true) { // starts by looking at the peaks. 
			if (array[i - 1].first.y < array[i + 1].first.y)
				sum += array[i].first.y - array[i + 1].first.y;
			else
				sum += array[i].first.y - array[i - 1].first.y;
		}
	}

	//END CASES
	if (array[(int)array.size() - 1].second == true)
		sum += array[(int)array.size() - 1].first.y - array[(int)array.size() - 2].first.y;
	if (array[0].second == true)
		sum += array[0].first.y - array[1].first.y;


	sum = sum / (int)array.size();
	return sum;
}

double ProjectionProfile::getWeight(DImage* profile, int scheme){
		switch (scheme){

		case WS_SUM :
			return getProfileSum(profile);
			break ;

		case WS_PEAK_VALY_DIFF:
			return getPeakValleySum(profile);
			break ;

		default:
			return 0 ;
		}
		
		return 0 ; 
	}