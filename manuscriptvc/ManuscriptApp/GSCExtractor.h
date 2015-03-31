#ifndef _GSC_EXTRACTOR_H_ 
#define _GSC_EXTRACTOR_H_ 

#include <opencv\cv.h>
#include "ImageTools.h"
#include "FeatureExtractor.h"
#include "GSCFeature.h"
#include <bitset>

using namespace std;

// Default values
const double DEFAULT_GRADIENT_CONSTANT = 56;
const double DEFAULT_STRUCTURAL_CONSTANT = 2.5;
const double DEFAULT_CONCAVITY_CONSTANT = 0.1;
const int DEFAULT_IMAGE_DIMENSIONS = 4;

class GSCExtractor : public FeatureExtractor {

private:
	// Thresholds constants
	double _gradientConstant;
	double _structuralConstant;
	double _concavityConstant;

	// Image regions
	vector<Mat> _imageRegions;

	// Number of image regions = rows * columns
	int _xNumOfColumns;
	int _yNumOfRows;

	// Regions seperate points
	vector<int> _xColumnsSeperatorsVec;
	vector<int> _yRowsSeperatorsVec;

	void init(int numOfColumns, int numOfRows, double gradientConstant, double structuralConstant, double concavityConstant);

	void calculateImageSeperators();
	void calculateHorizontalSeperators();
	void calculateVerticalSeperators();
	void buildImageGrid();
	void gradientsExtraction(vector<Mat>& angles, vector<ushort>& gradientVector);
	void structuralExtraction(vector<Mat>& angles, vector<ushort>& structuralVector);
	void densityExtraction(vector<bool>& densityVector);
	void largeStrokeExtraction(vector<uchar>& strokeVector);
	void concavityExtraction(vector<uchar>& concavityVector);

	int getMidBlackPixelsPointBetweenVerticalRegions(Mat& gray_img);
	int getMidBlackPixelsPointBetweenHorizontalRegions(Mat& gray_img);

	void discoverHorizontalStroke(double concavityThreshold, Mat& regionMat, int regionIndex, vector<uchar>& strokeVector);
	void discoverVerticalStroke(double concavityThreshold, Mat& regionMat, int regionIndex, vector<uchar>& strokeVector);

	void convolveRegion(double concavityThreshold, int fromRow, int fromColumn, int toRow, int toColumn, int reg_index, vector<uchar>& concavityVector);
	bool reachRight(int row, int col);
	bool reachLeft(int row, int col);
	bool reachUp(int row, int col);
	bool reachDown(int row, int col);
	bool reachUpRight(int row, int col);
	bool reachDownRight(int row, int col);
	bool reachUpLeft(int row, int col);
	bool reachDownLeft(int row, int col);
public:
	GSCExtractor() {
		init(DEFAULT_IMAGE_DIMENSIONS, DEFAULT_IMAGE_DIMENSIONS, DEFAULT_GRADIENT_CONSTANT, DEFAULT_STRUCTURAL_CONSTANT, DEFAULT_CONCAVITY_CONSTANT);
	}

	GSCExtractor(double gradientConstant, double structuralConstant, double concavityConstant) { 
		init(DEFAULT_IMAGE_DIMENSIONS, DEFAULT_IMAGE_DIMENSIONS, gradientConstant, structuralConstant, concavityConstant);
	}

	GSCExtractor(int numOfColumns, int numOfRows, double gradientConstant, double structuralConstant, double concavityConstant) { 
		init(numOfColumns, numOfRows, gradientConstant, structuralConstant, concavityConstant);
	}

	~GSCExtractor() { ; }

	void extract(vector<Feature*>&);
};

#endif