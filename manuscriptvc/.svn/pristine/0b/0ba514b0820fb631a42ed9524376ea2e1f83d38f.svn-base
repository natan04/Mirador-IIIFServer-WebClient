#include "FeatureAverageSum.h"

FeatureAverageSum::FeatureAverageSum(vector<float> avgsums)
{
	_avgsums = new vector<float>();
	for (int i = 0; i < avgsums.size(); i++){
		_avgsums->push_back(avgsums.at(i));
	}


}

double FeatureAverageSum::distance(Feature* a)
{
	//calculate the distance between this feature Average to another feature AverageSum
	vector<float> othervalues = ((FeatureAverageSum*)(a))->vectorize();
	int minVecLength = min(othervalues.size(), _avgsums->size());
	float returnVal = 0;
	for (int i = 0; i < minVecLength; i++){
		returnVal = returnVal + pow((othervalues.at(i) + _avgsums->at(i)),2);
	}
	returnVal = sqrt(returnVal);
	return returnVal;
}


void  FeatureAverageSum::sample2Row(Mat mat, int row)
{
	//row is the row in the matrix needed to be assigned
	//we will assign the row in mat to be _avgsums
	int col = 0;
	if (mat.rows <= row)
	{
		throw(new invalid_argument("invalid arguments type, mat hight "));
	}
	for (int i = 0; i<_avgsums->size() && col != mat.cols; col++, i++)
	{
		mat.at<uchar>(row, col, 0) = _avgsums->at(i);
	}

}

vector<float> FeatureAverageSum::vectorize()
{
	return *_avgsums;
}

FeatureAverageSum::~FeatureAverageSum(void)
{
	delete _avgsums;
}


