#include "FeatureExtractorTransition.h"


FeatureExtractorTransition::FeatureExtractorTransition(void)
{
}

FeatureExtractorTransition::FeatureExtractorTransition(Mat& image):FeatureExtractor(image)
{
	cvtColor( image, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}
void FeatureExtractorTransition::setImage(Mat& img)
{ 
	cvtColor( img, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}

void FeatureExtractorTransition::extract(vector<Feature*>& trans)
{
	int prevPixel;
	int transCounter ;
	vector<float> transitions = vector<float>();
	for(int i = 0 ; i< _image.cols;i++ ) //run on all the colums
	{   
		transCounter = 0 ;
		prevPixel = _image.at<uchar>(0,i);
		for(int j = 1 ; j < _image.rows;j++) //run on all the rows
		{
			if( (_image.at<uchar>(j,i)) != prevPixel ) //
			{
				transCounter++;	
			}
			prevPixel = _image.at<uchar>(j,i);
		}
		//trans.push_back(float(transCounter));
		transitions.push_back(transCounter);
	}
	FeatureTransitions* newFeature = new FeatureTransitions(transitions);
	trans.push_back(newFeature);
}
FeatureExtractorTransition::~FeatureExtractorTransition(void)
{
}
