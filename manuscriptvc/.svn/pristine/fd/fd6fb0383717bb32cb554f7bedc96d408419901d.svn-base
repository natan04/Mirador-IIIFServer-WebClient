#include "FeatureUpperEnvelope.h"




FeatureUpperEnvelope::FeatureUpperEnvelope(vector<float> upper) :Feature()
{
	//check wether the types in the vectors are of Pixel
	_upp = new vector<float>();
	for (int i = 0; i < upper.size(); i++)
	{
		_upp->push_back(upper.at(i));
	}
}

double FeatureUpperEnvelope::distance(Feature* a)
{
	//calculate the distance between this feature upperenvelope to another feature upperenvelope
	double total = 0;
	int counter = 0;

	vector<float> otherUp = ((FeatureUpperEnvelope*)(a))->vectorize();
	for (int i=0; i<_upp->size() && i<otherUp.size(); i++)
	{
		counter++;
		total += abs((_upp->at(i) - otherUp.at(i)));

	}

	return total / counter;

}

void  FeatureUpperEnvelope::sample2Row(Mat mat, int row)
{
	//row is the row in the matrix needed to be assigned
	//we will assign the row in mat to be _upp
	int col = 0;


	for (int i = 0; i<_upp->size() && col != mat.cols; col++, i++)
	{
		mat.at<uchar>(row, col, 0) = _upp->at(i);
	}
}

vector<float> FeatureUpperEnvelope::vectorize() {
	return *_upp;
}
FeatureUpperEnvelope::~FeatureUpperEnvelope(void)
{

	delete _upp;

}
