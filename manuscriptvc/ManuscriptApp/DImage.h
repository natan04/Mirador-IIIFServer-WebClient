#ifndef _DImage_H_ 
#define _DImage_H_

#include <opencv\cv.h>
#include <opencv2/highgui/highgui.hpp>
#include <vector>

#include "ImageFilter.h"
#include "ImageBinarizer.h"
#include "ImageEnhancer.h"
#include "ImageConverter.h"
#include "ImageProjector.h"
#include "BinaryComponentExtractor.h"
#include "FeatureExtractor.h"
#include "Metric.h"

using namespace std ;
using namespace cv ;

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	An image class that include the back functionality and property of an image </summary>
///
/// <remarks>	Jihad, 07/01/2015. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class DImage {
	Mat      _mat ;
	Mat      _mask ;
	Contour  _boundary ;
	Point2f  _com ;   // Center Of Mass ;
	int      _label ;
	int      _contrast ;
	vector<Feature*> _featureVector ;
	vector<float>    _bof ;
public:
	const static int DI_LABEL_UNSET = 0 ;
	const static int DI_LABEL_TEXT  = 1 ;
	const static int DI_LABEL_DRAW  = 2 ;
	const static int DI_LABEL_IMAGE = 3 ;
	const static int DI_LABEL_PARAGRAPH    = 4 ;
	const static int DI_LABEL_PAGE_MAIN    = 5 ;
	const static int DI_LABEL_PAGE_MARGIN  = 6 ;

	const static int DI_CONTRAST_UNSET     = 0 ;
	const static int DI_CONTRAST_BINARY1   = 1 ;
	const static int DI_CONTRAST_BINARY255 = 2 ;

public:
	DImage(){
		_label    = DI_LABEL_UNSET  ;
		_contrast = DI_CONTRAST_UNSET ; 
		_com.x = -1 ;
		_com.y = -1 ;
	}

	DImage(Mat mat){
		_mat = mat ;
		_label = DI_LABEL_UNSET  ;
		_contrast = DI_CONTRAST_UNSET ; 
		_com.x = -1 ;
		_com.y = -1 ;
	}
	
	~DImage(void){
		_mat.deallocate();	
	}

	void setLabel(int label) {
		_label = label ;
	}

	int getLabel() {
		return _label ;
	}

	void setMat(Mat mat){
		_mat = mat ;
	}

	Mat& getMat(){
		return _mat ;
	}

	Point2f setCOM() ;
	Point2f getCOM(){
		return _com ;
	}

	vector<Feature*>& featureVector(){
		return _featureVector ;
	}

	vector<float>& bof(){
		return _bof ;
	}

	void setContrast(int value){
		_contrast = value ;
	}

	int setContrast(){
		return _contrast ;
	}

	string bofString(){
		char buf[16] ;
		int  i ;
		string str = "{" ;
		for ( i = 0 ; i < _bof.size() - 1; i++ ){
			sprintf(buf, "%2.2f, ", _bof[i]) ; 
			str = str + buf ;
		}
		sprintf(buf, "%2.2f}", _bof[i]) ; 
		str = str + buf ;
		return str ;
	}

	double distance(FeatureExtractor* fx, Metric* metric, Mat& other_img){
		vector<Feature*> this_features ;
		vector<Feature*> other_features ;
		fx->extract(_mat, this_features);
		fx->extract(other_img, other_features);
		double d = metric->distance(this_features, other_features);
		return d ;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Spot segmentable components. If first segment the image in components and compare the 
	/// 			query image with each component </summary>
	///
	/// <remarks>	Jihad, 07/01/2015. </remarks>
	///
	/// <param name="fx">			[in,out] If non-null, the effects. </param>
	/// <param name="metric">   	[in,out] If non-null, the metric. </param>
	/// <param name="query_img">	[in,out] The query image. </param>
	///
	/// <returns>	An int. </returns>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	int spotSegmentableComponents(FeatureExtractor* fx, Metric* metric, Mat& query_img){
		BinaryComponentExtractor     component_extractor(this);
		vector<ConnectedComponent*>  components ;
		extractComponents(component_extractor, components);

		vector<Feature*> query_features ;
		fx->extract(query_img, query_features);

		vector<ConnectedComponent*>::iterator iter ;
		for(iter = components.begin(); iter != components.end(); iter++){
			vector<Feature*> this_features ;
			fx->extract(_mat, this_features);

			double d = metric->distance(this_features, query_features);
		}
		return (int) query_features.size() ;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Converts an image to a different format </summary>
	///
	/// <remarks>	Jihad, 07/01/2015. </remarks>
	///
	/// <param name="to_type">	Type of to. </param>
	///
	/// <returns>	null if it fails, else a DImage*. </returns>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	DImage* convert(int to_type) ;
	DImage* convert(ImageConverter& ic){
		ic.setImage(this);
		return ic.convert();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Enhances the given image using image_enhancer. </summary>
	///
	/// <remarks>	Jihad, 07/01/2015. </remarks>
	///
	/// <param name="ih">	[in,out] The ih. </param>
	///
	/// <returns>	null if it fails, else a DImage*. </returns>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	DImage* enhance(ImageEnhancer& image_enhancer){
		image_enhancer.setImage(this);
		return image_enhancer.enhance();
	}

	DImage* project(ImageProjector& ip){
		ip.setImage(this);
		return ip.project() ;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Binarizes the image using the given binarizer class . </summary>
	///
	/// <remarks>	Jihad, 07/01/2015. </remarks>
	///
	/// <param name="binarizer">	[in,out] The binarizer. </param>
	///
	/// <returns>	null if it fails, else a DImage*. </returns>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	DImage* binarize(ImageBinarizer& binarizer) {
		binarizer.setImage(this);
		DImage* img = binarizer.binarize() ;
		return img ;
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////
	/// <summary>	Filters the given image using image_filter. </summary>
	///
	/// <remarks>	Jihad, 07/01/2015. </remarks>
	///
	/// <param name="image_filter">	[in,out] A filter specifying the image. </param>
	///
	/// <returns>	null if it fails, else a DImage*. </returns>
	////////////////////////////////////////////////////////////////////////////////////////////////////

	DImage* filter(ImageFilter& image_filter) {
		image_filter.setImage(this);
		DImage* res = image_filter.filter();
		return res;
	}

	void extractFeatures(FeatureExtractor& feature_extractor, vector<Feature*>& feature_list){
		feature_extractor.setImage(this->getMat());
		feature_extractor.extract(feature_list);
	}

	void extractComponents(ComponentExtractor& ex, vector<ConnectedComponent*>& v){
		ex.setImage(this);
		ex.extract(v);
	}

	// Debug 
	void display(String win){
		namedWindow(win, cv::WINDOW_NORMAL);
		imshow(win, this->getMat());
	}
};

#endif 