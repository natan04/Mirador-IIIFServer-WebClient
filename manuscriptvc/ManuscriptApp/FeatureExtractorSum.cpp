#include "FeatureExtractorSum.h"

FeatureExtractorSum::FeatureExtractorSum(void)
{
}

FeatureExtractorSum::FeatureExtractorSum(Mat& image):FeatureExtractor(image)
{
	cvtColor( image, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}

void FeatureExtractorSum::setImage(Mat& img)
{ 
	cvtColor( img, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}

void FeatureExtractorSum::extract(vector<Feature*>& sums)
{
	int coloredCount ;
	vector<float> newSums = vector<float>(); 
	for(int i = 0 ; i< _image.cols;i++ ) //run on all the colums
	{   
		coloredCount = 0 ;
		for(int j = 1 ; j < _image.rows;j++) //run on all the rows
		{
			if( (_image.at<uchar>(j,i)) == ((uchar)(0)) ) //
			{
				coloredCount++;	
			}
		}
		//sums.push_back(new FeatureValue(coloredCount));
		
	}
	FeatureSum* newFeature = new FeatureSum(newSums);
	sums.push_back(newFeature);

}

FeatureExtractorSum::~FeatureExtractorSum(void)
{
}

