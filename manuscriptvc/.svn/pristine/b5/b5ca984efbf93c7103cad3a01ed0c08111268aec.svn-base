#ifndef _GSC_FEATURE_H_ 
#define _GSC_FEATURE_H_ 

#include <opencv\cv.h>
#include <opencv\ml.h>
#include <bitset>
#include "feature.h"

using namespace std;
using namespace cv;

// Features vector constants
const int SAMPLING_REGIONS = 12;
const int STRUCTURAL_DEF = 12;
const int LARGE_STROKE_DEF = 2;
const int LARGE_STROKE_H = 0;
const int LARGE_STROKE_V = 1;
const int CONCAVITY_U = 0;
const int CONCAVITY_D = 1;
const int CONCAVITY_L = 2;
const int CONCAVITY_R = 3;
const int CONCAVITY_H = 4;
const int CONCAVITY_OPT = 5;
const int DEGREE_GAP = 30;
const int CONCAVITY_HOLE_THRESHOLD = 6;

class GSCFeature : public Feature {

private:
	// A vector holding all features data
	vector<bool> _featureVector;
	size_t _featureVecDataSize;

	// Gradient, Structural and Concavity vectors
	vector<ushort> _gradientVector;
	vector<ushort> _structuralVector;
	vector<bool>   _densityVector;
	vector<uchar> _strokeVector;
	vector<uchar> _concavityVector;

	void buildFeatureVector();

public:

	GSCFeature(vector<ushort> gradientVector, vector<ushort> structuralVector, vector<bool> densityVector, vector<uchar> strokeVector, vector<uchar> concavityVector, size_t featureVecSize) {
		_gradientVector = gradientVector;
		_structuralVector = structuralVector;
		_densityVector = densityVector;
		_strokeVector = strokeVector;
		_concavityVector = concavityVector;

		_featureVecDataSize = featureVecSize;
	}

	~GSCFeature() { ; }

	vector<bool>& getFeatureVector();
	vector<bool>& getFeatureVector(int size);

	vector<ushort>& getGradientVector();
	vector<ushort>& getStructuralVector();
	vector<bool>& getDensityVector();
	vector<uchar>& getStrokeVector();
	vector<uchar>& getConcavityVector();

	void   sample2Row(Mat mat, int row);
	vector<float> vectorize();
	double distance(Feature* a);
};

#endif