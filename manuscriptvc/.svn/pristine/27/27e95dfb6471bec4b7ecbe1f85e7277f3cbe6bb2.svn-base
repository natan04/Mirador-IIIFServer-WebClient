#ifndef _IMAGE_TOOLS_H 
#define _IMAGE_TOOLS_H

#include <opencv\cv.h>
#include <opencv2/highgui/highgui.hpp>
#include <string>
#include "DImage.h"

namespace ImageTools {
	typedef std::pair<cv::Point2f, cv::Point2f>   Orientation ;
	static int  Index ;
	cv::Point2f centerOfMass(cv::Mat mat);
	cv::Mat     varianceAroundPoint(cv::Mat m, cv::Point2f point);
	Orientation orientation(cv::Mat m, cv::Point2f &com);
	void        smoothColumn(cv::Mat mat, cv::Mat filter, int col_idx); 
	void        remapColor(cv::Mat map, Vec3b color, cv::Point org, cv::Mat img);
	// Debug 
	cv::Mat     histogramImage(Mat histogram);
	void display(String win, DImage& img);
	void display(String win, Mat& img);

	void display(String win, int idx, DImage& img);
	void display(String win, int idx, Mat& img);
	void displayFresh(String win, Mat& img);
}

#endif 
