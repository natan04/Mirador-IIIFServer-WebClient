#include "FeatureLowerEnvelope.h"


FeatureLowerEnvelope::FeatureLowerEnvelope(vector<float> lower) :Feature()
{
	_low = new vector<float>();
	for (int i = 0; i < lower.size(); i++)
	{
		_low->push_back(lower.at(i));
	}
}

double FeatureLowerEnvelope::distance(Feature* a)
{
	//calculate the distance between this feature lowerenvelope to another feature lowerenvelope
	double total = 0, temp;
	int counter = 0;
	double maxdiff = 0;
	vector<float> otherLow = ((FeatureLowerEnvelope*)(a))->vectorize();
	
	for (int i =0,j=0; i<_low->size() && j<otherLow.size(); i++, j++)
	{
		counter++;
		counter++;
		total += abs((_low->at(i) - otherLow.at(i)));

	}

	return total / counter;
}

void  FeatureLowerEnvelope::sample2Row(Mat mat, int row) 
{
	//row is the row in the matrix needed to be assigned
	//we will assign the row in mat to be _low
	int col = 0;


	for (int i=0; i<_low->size() && col != mat.cols; col++, i++)
	{
		mat.at<uchar>(row, col, 0) = _low->at(i);
	}
}
vector<float> FeatureLowerEnvelope::vectorize() {
	return *_low;
}
FeatureLowerEnvelope::~FeatureLowerEnvelope(void)
{

	delete _low;

}
