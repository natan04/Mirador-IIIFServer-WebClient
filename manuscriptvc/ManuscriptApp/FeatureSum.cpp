#include "FeatureSum.h"

FeatureSum::FeatureSum(vector<float> sums)
{
	_sums = new vector<float>();
	for (int i = 0; i < sums.size(); i++){
		_sums->push_back(sums.at(i));
	}


}

double FeatureSum::distance(Feature* a)
{
	//calculate the distance between this feature Sum to another feature Sum
	vector<float> othervalues = ((FeatureSum*)a)->vectorize();
	int minVecLength = min(othervalues.size(), _sums->size());
	float returnVal = 0;
	for (int i = 0; i < minVecLength; i++){
		returnVal = returnVal + pow((othervalues.at(i) + _sums->at(i)) , 2);
	}
	returnVal = sqrt(returnVal);
	return returnVal;

}
void  FeatureSum::sample2Row(Mat mat, int row)
{
	//row is the row in the matrix needed to be assigned
	//we will assign the row in mat to be _sums
	int col = 0;


	for (int i = 0; i<_sums->size() && col != mat.cols; col++, i++)
	{
		mat.at<uchar>(row, col, 0) = _sums->at(i);
	}
}

vector<float> FeatureSum::vectorize()
{
	return *_sums;
}
FeatureSum::~FeatureSum(void)
{

	delete _sums;
}
