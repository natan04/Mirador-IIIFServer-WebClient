#include "FeatureValue.h"

FeatureValue::FeatureValue(void):Feature()
{
	_val = 0.0 ; 
}
FeatureValue::FeatureValue(double val):Feature()
{
	_val = val;
}
void FeatureValue::SetVal(double val)
{
	_val = val;
}
double FeatureValue::getVal(void)
{
	return _val ;
}

double FeatureValue::distance(Feature* a)
{
		return (abs((long)_val - (long)(((FeatureValue*)(a))->getVal())));
}

void FeatureValue::sample2Row(Mat & mat, int row)
{
	
	if( mat.rows <= row )
	{  throw(new invalid_argument("invalid arguments type, mat length ") ); }

	for(int col = 0 ; col == mat.cols ; col++)
	{
		mat.at<uchar>(row, col, 0)= getVal();
	}
}

FeatureValue::~FeatureValue(void)
{
}
