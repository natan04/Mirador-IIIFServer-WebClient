#include "FeatureExtractorLowerEnvelope.h"
#include "FeatureLowerEnvelope.h"


FeatureExtractorLowerEnvelope::FeatureExtractorLowerEnvelope(void)
{
}
FeatureExtractorLowerEnvelope::FeatureExtractorLowerEnvelope(Mat& image):FeatureExtractor(image)
{
	
	cvtColor( image, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}

void FeatureExtractorLowerEnvelope::setImage(Mat& img)
{ 
	cvtColor( img, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}
void FeatureExtractorLowerEnvelope::extract(vector<Feature*>& givenVector )
{
	vector<float> lowEnv = vector<float>();
	for(int i = 0 ; i< _image.cols;i++ ) //run on all the colums
	{
		for(int j =0 ; j <=  _image.rows - 1;j++) //run on all the rows
		{
			if( (_image.at<uchar>(j,i)) == 0 ) //
			{
				lowEnv.push_back(float(j)); // push the new feature of the upper envelop to the vector
				break; //if found go to the next column
			}
		}
	}
	FeatureLowerEnvelope* newFeature = new FeatureLowerEnvelope(lowEnv);
	givenVector.push_back((Feature*)newFeature);
}
FeatureExtractorLowerEnvelope::~FeatureExtractorLowerEnvelope(void)
{
}
