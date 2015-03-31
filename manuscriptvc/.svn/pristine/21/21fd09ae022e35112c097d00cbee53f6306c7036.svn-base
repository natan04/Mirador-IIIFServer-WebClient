#include "stdafx.h"
#include "FeatureGSC.h"

vector<bool>& FeatureGSC::getFeatureVector() {
	// Feature vector already calculated
	if (_featureVector.size() == _featureVecDataSize) {
		return _featureVector;
	}

	// Feature vector is not set yet so resizing it to the actual data size
	_featureVector.resize(_featureVecDataSize);

	// Build the feature vector
	buildFeatureVector();

	return _featureVector;
}

vector<bool>& FeatureGSC::getFeatureVector(int size) {
	if (_featureVecDataSize < size) {
		return getFeatureVector();
	}

	// Resizing to new size
	_featureVector.resize(size);

	// Build the feature vector
	buildFeatureVector();

	return _featureVector;
}

vector<ushort>& FeatureGSC::getGradientVector() {
	return _gradientVector;
}

vector<ushort>& FeatureGSC::getStructuralVector() {
	return _structuralVector;
}

vector<bool>& FeatureGSC::getDensityVector() {
	return _densityVector;
}

vector<uchar>& FeatureGSC::getStrokeVector() {
	return _strokeVector;
}

vector<uchar>& FeatureGSC::getConcavityVector() {
	return _strokeVector;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Builds the GSC vector according to the sub-vectors </summary>
///
/// <remarks> Shay Yacobinski </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////
void FeatureGSC::buildFeatureVector() {
	int featureVecIndx = 0;

	// Gradient
	for (int regionIndx = 0; regionIndx < _gradientVector.size(); regionIndx++) {
		for (int bitIndx = 0; bitIndx < SAMPLING_REGIONS; bitIndx++) {
			// Shift the value in the region by bitIndx and mask with 1 to get the first bit only
			_featureVector[featureVecIndx] = (_gradientVector[regionIndx] >> bitIndx) & 1;

			// Next bit
			++featureVecIndx;
		}
	}

	// Structural
	for (int regionIndx = 0; regionIndx < _gradientVector.size(); regionIndx++) {
		for (int bitIndx = 0; bitIndx < STRUCTURAL_DEF; bitIndx++) {
			// Shift the value in the region by bitIndx and mask with 1 to get the first bit only
			_featureVector[featureVecIndx] = (_structuralVector[regionIndx] >> bitIndx) & 1;

			// Next bit
			++featureVecIndx;
		}
	}

	// Density
	for (int regionIndx = 0; regionIndx < _gradientVector.size(); regionIndx++) {
		// Density is bool so just copy the value
		_featureVector[featureVecIndx] = _densityVector[regionIndx];

		// Next bit
		++featureVecIndx;
	}

	// Large Stroke
	for (int regionIndx = 0; regionIndx < _gradientVector.size(); regionIndx++) {
		for (int bitIndx = 0; bitIndx < LARGE_STROKE_DEF; bitIndx++) {
			// Shift the value in the region by bitIndx and mask with 1 to get the first bit only
			_featureVector[featureVecIndx] = (_strokeVector[regionIndx] >> bitIndx) & 1;

			// Next bit
			++featureVecIndx;
		}
	}

	// Concavity
	for (int regionIndx = 0; regionIndx < _gradientVector.size(); regionIndx++) {
		for (int bitIndx = 0; bitIndx < CONCAVITY_OPT; bitIndx++) {
			// Shift the value in the region by bitIndx and mask with 1 to get the first bit only
			_featureVector[featureVecIndx] = (_concavityVector[regionIndx] >> bitIndx) & 1;

			// Next bit
			++featureVecIndx;
		}
	}
}

void FeatureGSC::sample2Row(Mat samples, int row) {

}

double FeatureGSC::distance(Feature* a){
	return 0;
}

vector<float> FeatureGSC::vectorize() {
	vector<float> array;
	return array;
}