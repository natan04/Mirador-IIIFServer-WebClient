#include "stdafx.h"
#include "ImageTools.h"
#include "BinarizerOtsu.h"
#include "DImage.h"



DImage* BinarizerOtsu::binarize(){
	Mat binary ;
	Mat img = _image->getMat() ;

	Mat  histogram ;
	int  channels[] = {0} ;
	int  bins[1]   ;
	bins[0] = _binCount ;
	const float* hist_range[] = {_range} ;

	// Compute the histogram 
	calcHist(&img, 1, channels, Mat(), histogram, 1, bins, hist_range, true, false);
	Mat normalized_histogram ;
	double scale_factor = 1.0 /(img.cols * img.rows); 
	histogram.convertTo(normalized_histogram, CV_32F, scale_factor);

	// Compute Otsu theshold 
	double threshold = geOtsuThreshold(normalized_histogram) ;
	Mat hist_img = ImageTools::histogramImage(normalized_histogram) ;
	cv::threshold(img, binary, threshold/(double)bins[0], 255, cv::THRESH_BINARY);
	if ( img.type() == CV_32F )
		binary.convertTo(binary, CV_8U);
	
	return new DImage(binary) ;
}

// Normlized Histogram 
int BinarizerOtsu::geOtsuThreshold(Mat histogram){
	float max_variance = 0;
	int   threshold = 0;

	float total_weight = 0 ;
	for ( int i = 0; i < histogram.rows; i++ ){
		total_weight += i*histogram.at<float>(i); 
	}

	float bg_sum  = 0;
	float bg_weight = 0 ;
	for (int i=0 ; i < histogram.rows ; i++) {
		float fg_sum, fg_mean, bg_mean ;
		bg_sum += histogram.at<float>(i);      
		fg_sum = 1.0f - bg_sum;                
		
		bg_weight += i * histogram.at<float>(i);
		bg_mean = bg_weight / bg_sum ; 
		fg_mean = (total_weight - bg_weight)/ fg_sum ;

		// Calculate Between Class Variance
		float between_variance = bg_sum * fg_sum * (bg_mean - fg_mean) * (bg_mean - fg_mean);

		// Check if new maximum found
		if (between_variance > max_variance) {
			max_variance = between_variance;
			threshold = i;
		}
	}
	return threshold ;
}
