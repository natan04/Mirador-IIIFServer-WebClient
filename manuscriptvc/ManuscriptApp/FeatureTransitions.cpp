#include "FeatureTransitions.h"
FeatureTransitions::FeatureTransitions(vector<float> trans)
{
	_trans = new vector<float>();
	for (int i = 0; i < trans.size(); i++){
		_trans->push_back(trans.at(i));
	}
}


double FeatureTransitions::distance(Feature* a)
{
	//calculate the distance between this feature Transitions to another feature Transitions
	vector<float> othervalues = ((FeatureTransitions*)(a))->vectorize();
	float minVecLength = min(othervalues.size(), _trans->size());
	float returnVal = 0;
	for (int i = 0; i < minVecLength; i++){
		returnVal = returnVal + pow((othervalues.at(i) + _trans->at(i)) ,2);
	}
	returnVal = sqrt(returnVal);
	return returnVal;
}

void  FeatureTransitions::sample2Row(Mat mat, int row)
{
	//row is the row in the matrix needed to be assigned
	//we will assign the row in mat to be _trans
	int col = 0;


	for (int i = 0; i<_trans->size() && col != mat.cols; col++, i++)
	{
		mat.at<uchar>(row, col, 0) = _trans->at(i);
	}
}
vector<float> FeatureTransitions::vectorize()
{
	return *_trans;
}

FeatureTransitions::~FeatureTransitions(void)
{
	delete _trans;
}
