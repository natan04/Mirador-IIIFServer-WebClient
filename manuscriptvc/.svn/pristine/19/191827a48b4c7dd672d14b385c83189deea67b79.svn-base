#include "FeatureExtractorUpperEnvelope.h"
#include "FeatureUpperEnvelope.h"


FeatureExtractorUpperEnvelope::FeatureExtractorUpperEnvelope(void)
{
}
FeatureExtractorUpperEnvelope::FeatureExtractorUpperEnvelope(Mat& image):FeatureExtractor(image)
{
	cvtColor( image, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}


void FeatureExtractorUpperEnvelope::setImage(Mat& img)
{ 
	cvtColor( img, _image , CV_BGR2GRAY );
	threshold(_image ,_image ,100,255, THRESH_BINARY);
}

void FeatureExtractorUpperEnvelope::extract(vector<Feature*>& givenVector )
{
	vector<float> upperEnv = vector<float>();
	for(int i = 0 ; i< _image.cols;i++ ) //run on all the colums
	{
		for(int j = _image.rows - 1 ; j >= 0;j--) //run on all the rows
		{
			if( (_image.at<uchar>(j,i)) == 0 ) //
			{
				upperEnv.push_back(float(j)); // push the new feature of the upper envelop to the vector
				break; //if found go to the next column
			}
		}
	}
	FeatureUpperEnvelope* newFeature = new FeatureUpperEnvelope(upperEnv);
	givenVector.push_back((Feature*)newFeature);
}

FeatureExtractorUpperEnvelope::~FeatureExtractorUpperEnvelope(void)
{
}
