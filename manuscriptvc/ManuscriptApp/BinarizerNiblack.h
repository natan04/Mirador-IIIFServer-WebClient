#ifndef _BINARIZER_NIBLACK_H_ 
#define _BINARIZER_NIBLACK_H_ 

#include "imagebinarizer.h"
#include <iostream>
#include "stdafx.h"

#define uget(x,y)    at<unsigned char>(y,x)
#define uset(x,y,v)  at<unsigned char>(y,x)=v;
#define fget(x,y)    at<float>(y,x)
#define fset(x,y,v)  at<float>(y,x)=v;

class BinarizerNiblack : public ImageBinarizer{

public:
	BinarizerNiblack(void);
	~BinarizerNiblack(void);
	double calcLocalStats(Mat &im, Mat &map_m, Mat &map_s, int winx, int winy);
	void niblackCalc(Mat im, Mat output, int winx, int winy, double k, double dR);
	DImage* binarize();
};

#endif