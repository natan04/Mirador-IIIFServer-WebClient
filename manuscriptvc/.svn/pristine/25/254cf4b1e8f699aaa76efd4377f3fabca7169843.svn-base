#ifndef _AMITBINARIZER_H
#define _AMITBINARIZER_H 

#include "ImageBinarizer.h"
#include <iostream>
#include "stdafx.h"
#include "ComponentExtractorBinary.h"
#include"BinarizerNiblack.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Amit binarizer class implements the  Binarization of Degraded Document Images Based on
///Combination of Contrast Images  < / summary>
///
/// <remarks>	Amit Bitan 30/12/2014. </remarks> // amit changes
////////////////////////////////////////////////////////////////////////////////////////////////////
#define uget(x,y)    at<unsigned char>(y,x)
#define uset(x,y,v)  at<unsigned char>(y,x)=v;
#define fget(x,y)    at<float>(y,x)
#define fset(x,y,v)  at<float>(y,x)=v;
class AmitBinarization : public ImageBinarizer {
private:
	int strokeWidth;
	BinarizerNiblack niBlack;

public:
	AmitBinarization(void);
	~AmitBinarization(void);
	int getSW(){ return this->strokeWidth; }
	void setSW(int strokeWidth){ this->strokeWidth = strokeWidth; }
	
	int* setInFirstArr(Mat *im, int x, int y);
	int* setInSecArr(Mat *im, int x, int y);
	
	float mStrokeWidthCalc(Mat mat, int x, int y);
	void structuralContrast(Mat im, Mat out);
	int mMin(Mat im, int x, int y);
	int mMax(Mat im, int x, int y);
	void structuralContrastNorm(Mat im, Mat out);
	void structuralContrastComb(Mat scImg, Mat scNormImg, Mat result);
	void structuralContrastMult(Mat scCombImg, Mat scNormImg, Mat result);
	void binarizationProcess(Mat niBlack, Mat Mult, Mat img, Mat output);
	void postProcessing(Mat weak, Mat output);
	void reconstruction(Mat weakImg, Mat strongImg, Mat finalResult);
	DImage* binarize();
};

#endif