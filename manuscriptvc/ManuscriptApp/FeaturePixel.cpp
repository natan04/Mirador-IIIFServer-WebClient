#include "FeaturePixel.h"

FeaturePixel::FeaturePixel(void):Feature()
{
	p  = cvPoint(0,0);
}

FeaturePixel::FeaturePixel(int x,int y):Feature()
{
	p  = cvPoint(x,y);
}

int FeaturePixel::getX()
{
	return p.x;	
}

int FeaturePixel::getY()
{
	return p.y;
}

void FeaturePixel::setX(int x)
{
	p.x = x;
}

void FeaturePixel::setY(int y)
{
	p.y = y;
}

double FeaturePixel::distance(Feature* a)
{

		int aX = ((FeaturePixel*)(a))->getX();//get the x component of the Feature a
		int aY = ((FeaturePixel*)(a))->getY();//get the y component of the Feature a	
		return sqrt(pow(p.x-aX , 2 ) + pow(p.y-aY , 2));//calculate the distanse

}

void FeaturePixel::sample2Row(Mat & mat, int row)
{}

FeaturePixel::~FeaturePixel(void)
{
	
}
