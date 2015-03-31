
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
#include "ClassifierEM.h"

using namespace cv ;
using namespace std ;


DImage GetLetterImage(string text, Size img_size, double font_scale, int thickness){
	int font_face = FONT_HERSHEY_SCRIPT_SIMPLEX;
	int baseline=0;
	Mat img(img_size, CV_8U, Scalar::all(0));
	Size text_size ;
	text_size = getTextSize(text, font_face, font_scale, thickness, &baseline);
	if (( text_size.height + 3*thickness > img.rows ) || (text_size.width + 3*thickness > img.cols)){
		while (( text_size.height + 3*thickness > img.rows ) || (text_size.width + 3*thickness > img.cols)){
			font_scale -= 0.2 ;
			text_size = getTextSize(text, font_face, font_scale, thickness, 0);
		}
	}
	Point org((img.cols - text_size.width - 3*thickness)/2, (img.rows + text_size.height + 3*thickness)/2 - baseline);
	putText(img, text, org, font_face, font_scale, Scalar::all(255), thickness, 8);
	return DImage(img) ;
}

void GenerateDataSet(vector<DImage>& list ){
	string text = " ";
	for ( char c = 'A'; c <= 'Z'; c++ ){
		text[0] = c ;
		DImage img = GetLetterImage(text, Size(200, 250), 6, 10);
		list.push_back(img);
	}
}

void ExtractFeatures(vector<DImage>& images, ExtractorGaborBlob  extractor, vector<vector<Feature*>>& features){
	for ( int i = 0 ; i < images.size() ; i++ ){
		DImage img(images[i]);
		images[i].extractFeatures(extractor, images[i].featureVector());
	}
}

void PrepareTrainingFeatures(vector<DImage>& pattern, vector<Feature*>& train_list){
	for ( int i = 0 ; i < pattern.size(); i++ )
		train_list.insert(train_list.begin(), pattern[i].featureVector().begin(), pattern[i].featureVector().end());
}

float Distance(vector<float>& a, vector<float>& b){
	float sum = 0 ; 
	for ( int i = 0 ; i < a.size(); i++ ){
		sum += (a[i] - b[i])*(a[i] - b[i]); 
	}
	return sqrt(sum);
}

void TestGaborFeatures(DImage *img, int n, int r, double sigma, double lambda, double aspect){
	cout << "N: " << n <<  " R: " << r << " Sigma: " << sigma << " Lambda: " << lambda << endl ;
	ExtractorGaborBlob  extractor(n, r, sigma, lambda, aspect);
	vector<vector<Feature*>>    feature_list ;
	vector<Feature*>            dataset_features ;
	vector<DImage> images ;
	GenerateDataSet(images);
	ClassifierEM classifier;

	ExtractFeatures(images, extractor, feature_list);
	PrepareTrainingFeatures(images, dataset_features);
	cout << "Dataset Features: " << dataset_features.size() << endl ;
	classifier.setNumClusters(16);
	classifier.train(dataset_features);
	cout << "Training Complete ..." << endl ;

	float probability ;
	for ( int i = 0 ; i < images.size() ; i++ ){
		images[i].bof().resize(16, 0);
		for ( int j = 0 ; j < images[i].featureVector().size() ; j++ ){
			int label = classifier.predict(images[i].featureVector()[j], probability);
			images[i].bof()[label] ++ ;
		}
		cout << "BOF: "  << images[i].bofString() << endl ;
	}

	for ( int i = 0 ; i < images.size(); i++ ) {
		cout << "D(" << i << ")" ;
		for ( int j = i ; j < images.size(); j++ )
			cout << Distance(images[i].bof(), images[j].bof()) << ", " ;
		cout << endl ;
	}
	getchar() ;
}

void GaborWordRecognition(DImage* img, char* argv[]){
	TestGaborFeatures(img, atoi(argv[1]), atoi(argv[2]), atof(argv[3]), atof(argv[4]), atof(argv[5]));
}


