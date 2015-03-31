// ManuscriptApp.cpp : Defines the entry point for the console application.
//
//#define _USE_MATH_DEFINES
#include "stdafx.h"
#include <math.h>
#include <opencv/cv.h>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <iostream>
#include "DImage.h"
#include "FeatureInt.h"
#include "FeatureScalar.h"
#include "MetricDTW.h"
#include "ProjectionProfile.h"
#include "TextLineExtractorProfileSeam.h"
#include "FeatureGaborBlob.h"
#include "ExtractorGaborBlob.h"
#include "RafiTextLineExtractor.h"
#include "FilterAnisotropic.h"
#include "BinarizerOtsuGray.h"
#include "BinarizerOtsu.h"
#include "ComponentExtractorBinary.h"
#include "ApplicationList.h"
#include "AmitBinarization.h"

using namespace cv ;
using namespace std ;

string ImagePath ;

void display(String win, DImage& img){
	namedWindow(win, cv::WINDOW_NORMAL);
	imshow(win, img.getMat());
}

void display(String win, Mat img){
	namedWindow(win, cv::WINDOW_NORMAL);
	imshow(win, img);
}

void testDTW(){
	MetricDTW metric ;
	Feature* n ;
	vector<Feature*> a ;
	vector<Feature*> b ;
	for (int i = 0 ; i < 100; i++ ){
		n = new FeatureScalar<int>(i);
		a.push_back(n);
		b.push_back(n);
	}
	double d = metric.distance(a, b);
	cout << d << endl ;
}


void TestRafiAlg(DImage *img) {
	
	Mat imag = img->getMat();
	RafiTextLineExtractor extractor;

	extractor.setImage(imag);
	extractor.extract();

	namedWindow("win", cv::WINDOW_NORMAL);
	imshow("win", img->getMat());

}

void TestProjection(DImage *img){

	ProjectionProfile proj(ProjectionProfile::MODE_SUM);
	
	DImage* img_cpy = new DImage(img->getMat().clone());

	DImage* col_img = img->project(proj);
	
	for ( int i = 0 ; i < 10 ; i++ )
		proj.smoothProfile(col_img->getMat());

	TextLineExtractorProfileSeam extractor(proj, col_img, img->getMat());
	extractor.extract();
	
	proj.drawProfile(img_cpy, col_img, 500);
	display("img", *img_cpy);

}


int main(int argc, char* argv[]){
	ImagePath = "C:\\" ;
	//Mat mat = cv::imread(ImagePath+"Ka.jpg");
	//Mat mat = cv::imread(ImagePath+"WordPartsLana.jpg");
	Mat mat = cv::imread("C:\\Users\\user\\Documents\\Work\\Images\\Sample3.png");
	//Mat mat = cv::imread(ImagePath+"latin.png");
	//Mat mat = cv::imread(ImagePath+"hebrew.jpeg");
	//Mat mat = cv::imread(ImagePath+"lamdb.jpg");

	DImage image(mat);
	Mat im_gray;
	cvtColor(mat, im_gray, CV_RGB2GRAY);
	DImage *gray = image.convert(CV_8U);
		
	//GaborWordRecognition(gray,argv);
	//OtsuBinarizer binarizer;
	//DImage* binary = gray->binarize(binarizer);

	//display("Binary", *binary);
	//TestGaborFeatures(gray, atoi(argv[1]), atoi(argv[2]), atof(argv[3]), atof(argv[4]), atof(argv[5]));
	
	//TestProjection(gray);
	//TestRafiAlg(gray);
	
	//TestGaborFilter("D:/Research/Dataset/ifnenit_v2.0p1e/data/set_a/tif");
	TestRafiAlg(gray);
	//AmitBinarization binarizer;
	//binarizer.setSW(1);
	//DImage* binary = gray->binarize(binarizer);

	//display("Binary", *binary);
	waitKey();
	
	return 0;
}

