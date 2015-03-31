#include "stdafx.h"
#include "GSCExtractor.h"

void GSCExtractor::extract(vector<Feature*>& list) {
	// Seperate features vectors
	vector<ushort> gradientVector(_imageRegions.size());
	vector<ushort> structuralVector(_imageRegions.size());
	vector<bool> densityVector(_imageRegions.size());
	vector<uchar> strokeVector(_imageRegions.size());
	vector<uchar> concavityVector(_imageRegions.size());

	vector<Mat> angles(_imageRegions.size());

	// Creating a grid of n*m dimensions to extract features from
	calculateImageSeperators();

	buildImageGrid();

	// Gradient feature extrcation
	gradientsExtraction(angles, gradientVector);

	// Structural feature extrcation
	structuralExtraction(angles, structuralVector);

	// Concavity feature extrcation
	densityExtraction(densityVector);

	largeStrokeExtraction(strokeVector);

	concavityExtraction(concavityVector);

	size_t featureDataSize = (_imageRegions.size() * SAMPLING_REGIONS) +	// Gradient size
							(_imageRegions.size() * STRUCTURAL_DEF) +	// Structural size
							_imageRegions.size() +						// Density size
							(_imageRegions.size() * LARGE_STROKE_DEF) + // Large Stroke size
							(_imageRegions.size() * CONCAVITY_OPT);		// Concavity size

	GSCFeature* feature = new GSCFeature(gradientVector, structuralVector, densityVector, strokeVector, concavityVector, featureDataSize);

	list.push_back(feature);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Initializes the data members </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="numOfColumns"> Number of desired columns, or the x dimension </param>
/// <param name="numOfRows"> Number of desired rows, or the y dimension </param>
/// <param name="gradientConstant"> A constant used for calculating the gradient threshold </param>
/// <param name="structuralConstant"> A constant used for calculating the structural threshold </param>
/// <param name="concavityConstant"> A constant used for calculating the concavity threshold </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::init(int numOfColumns, int numOfRows, double gradientConstant, double structuralConstant, double concavityConstant) {
	_yNumOfRows = numOfRows;
	_xNumOfColumns = numOfColumns;
	_gradientConstant = gradientConstant;
	_structuralConstant = structuralConstant;
	_concavityConstant = concavityConstant;

	_xColumnsSeperatorsVec.resize(_xNumOfColumns + 1);
	_yRowsSeperatorsVec.resize(_yNumOfRows + 1);
	_imageRegions.resize(_xNumOfColumns * _yNumOfRows);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Extracts the Concavity feature. For every region, shoots 8 rays from every background
///				pixel to different directions in order to find foreground pixels, and evaluates
///				the surroundings of that pixel accordingly </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="concavityVector"> Concavity feature vector </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::concavityExtraction(vector<uchar>& concavityVector) {
	double concavityThreshold = 0;

	int regionIndex = 0;

	for (int y = 0; y < _yNumOfRows; y++) {
		for (int x = 0; x < _xNumOfColumns; x++) {
			// Calculate a new threshold for this region
			concavityThreshold = _concavityConstant * (_imageRegions[regionIndex].rows * _imageRegions[regionIndex].cols);

			// peforms that task for each background pixel in the region
			convolveRegion(concavityThreshold, _yRowsSeperatorsVec[y], _xColumnsSeperatorsVec[x], _yRowsSeperatorsVec[y + 1], _xColumnsSeperatorsVec[x + 1], regionIndex, concavityVector);
			
			// next region
			++regionIndex;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Extracts the Large Stroke feature. For each region determines if there's a large
///				horizontal or vertical stroke preset </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="strokeVector"> Large stroke feature vector </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::largeStrokeExtraction(vector<uchar>& strokeVector) {
	double concavityThreshold = 0;

	for (int reg_indx = 0; reg_indx < _imageRegions.size(); reg_indx++) {

		// Calculate a new threshold for this region
		concavityThreshold = _concavityConstant * (_imageRegions[reg_indx].rows * _imageRegions[reg_indx].cols);

		// Evaluates if a horizontal stroke is preset
		discoverHorizontalStroke(concavityThreshold, _imageRegions[reg_indx], reg_indx, strokeVector);

		// Evaluates if a vertical stroke is preset
		discoverVerticalStroke(concavityThreshold, _imageRegions[reg_indx], reg_indx, strokeVector);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Extracts the Density feature. For each region determines if the number of
///				foreground pixels is above a threshold </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="densityVector"> Density feature vector </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::densityExtraction(vector<bool>& densityVector) {
	double concavityThreshold = 0;
	int foregroundPixels = 0;

	for (int reg_indx = 0; reg_indx < _imageRegions.size(); reg_indx++) {

		// Calculate a new threshold for this region
		concavityThreshold = _concavityConstant * (_imageRegions[reg_indx].rows * _imageRegions[reg_indx].cols);

		// Count all the foreground pixels
		foregroundPixels = _imageRegions[reg_indx].cols * _imageRegions[reg_indx].rows - countNonZero(_imageRegions[reg_indx]);

		// Updates accordingly
		if (foregroundPixels >= concavityThreshold) {
			densityVector[reg_indx] = 1;
		}

		concavityThreshold = 0;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Extracts the Structural feature. For each image region, determines if a number of
///				pixels above a threshold answer to each of 12 patterns that represent
///				mini strokes in the image </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="angles"> A vector of Mat objects that hold the gradients for each image region </param>
/// <param name="structuralVector"> Structural feature vector </param>
/////////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::structuralExtraction(vector<Mat>& angles, vector<ushort>& structuralVector) {
	int structuralFeatureCount[STRUCTURAL_DEF];

	double structuralThreshold = 0;

	for (int reg_indx = 0; reg_indx < _imageRegions.size(); reg_indx++) {
		// Zeroing the structural count array
		for (int g = 0; g < STRUCTURAL_DEF; g++) {
			structuralFeatureCount[g] = 0;
		}

		// We need to check each pixel's 8 neighbors so we scan each region without the "outer ring" of pixels, meanin from 1 to n-1
		for (int i = 1; i < angles[reg_indx].rows - 1; i++) {
			for (int j = 1; j < angles[reg_indx].cols - 1; j++) {
				/*	N0 - (i, j+1)
				N1 - (i-1, j+1)
				N2 - (i-1, j)
				N3 - (i-1, j-1)
				N4 - (i, j-1)
				N5 - (i+1, j-1)
				N6 - (i+1, j)
				N7 - (i+1, j+1)
				*/
				// Rule 1 - Horizontal line type 1
				if (((angles[reg_indx].at<short>(i, j + 1) >= 60) && (angles[reg_indx].at<short>(i, j + 1) <= 120)) && // N0(2,3,4)
					((angles[reg_indx].at<short>(i, j - 1) >= 60) && (angles[reg_indx].at<short>(i, j - 1) <= 120))) { // N4(2,3,4)
					++structuralFeatureCount[0];
				}
				// Rule 2 - Horizontal line type 2
				else if (((angles[reg_indx].at<short>(i, j + 1) >= 240) && (angles[reg_indx].at<short>(i, j + 1) <= 300)) && // N0(8,9,10)
					((angles[reg_indx].at<short>(i, j - 1) >= 240) && (angles[reg_indx].at<short>(i, j - 1) <= 300))) { // N4(8,9,10)
					++structuralFeatureCount[1];
				}
				// Rule 3 - Vertical line type 1
				else if (((angles[reg_indx].at<short>(i - 1, j) >= 150) && (angles[reg_indx].at<short>(i - 1, j) <= 210)) && // N2(5,6,7)
					((angles[reg_indx].at<short>(i + 1, j) >= 150) && (angles[reg_indx].at<short>(i + 1, j) <= 210))) { // N6(5,6,7)
					++structuralFeatureCount[2];
				}
				// Rule 4 - Vertical line type 2
				else if ((((angles[reg_indx].at<short>(i - 1, j) > 0) && (angles[reg_indx].at<short>(i - 1, j) <= 30)) || ((angles[reg_indx].at<short>(i - 1, j) >= 330) && (angles[reg_indx].at<short>(i - 1, j) <= 360))) && // N2(1,0,11)
					(((angles[reg_indx].at<short>(i + 1, j) > 0) && (angles[reg_indx].at<short>(i + 1, j) <= 30)) || ((angles[reg_indx].at<short>(i + 1, j) >= 330) && (angles[reg_indx].at<short>(i + 1, j) <= 360)))) { // N6(1,0,11)
					++structuralFeatureCount[3];
				}
				// Rule 5 - Diagonal rising type 1
				else if (((angles[reg_indx].at<short>(i + 1, j - 1) >= 120) && (angles[reg_indx].at<short>(i + 1, j - 1) <= 180)) && // N5(4,5,6)
					((angles[reg_indx].at<short>(i - 1, j + 1) >= 120) && (angles[reg_indx].at<short>(i - 1, j + 1) <= 180))) { // N1(4,5,6)
					++structuralFeatureCount[4];
				}
				// Rule 6 - Diagonal rising type 2
				else if (((angles[reg_indx].at<short>(i + 1, j - 1) >= 300) && (angles[reg_indx].at<short>(i + 1, j - 1) <= 360)) && // N5(10,11,0)
					((angles[reg_indx].at<short>(i - 1, j + 1) >= 300) && (angles[reg_indx].at<short>(i - 1, j + 1) <= 360))) { // N1(10,11,0)
					++structuralFeatureCount[5];
				}
				// Rule 7 - Diagonal falling type 1
				else if (((angles[reg_indx].at<short>(i - 1, j - 1) >= 30) && (angles[reg_indx].at<short>(i - 1, j - 1) <= 90)) && // N3(1,2,3)
					((angles[reg_indx].at<short>(i + 1, j + 1) >= 30) && (angles[reg_indx].at<short>(i + 1, j + 1) <= 90))) { // N7(1,2,3)
					++structuralFeatureCount[6];
				}
				// Rule 8 - Diagonal falling type 2
				else if (((angles[reg_indx].at<short>(i - 1, j - 1) >= 210) && (angles[reg_indx].at<short>(i - 1, j - 1) <= 270)) && // N3(7,8,9)
					((angles[reg_indx].at<short>(i + 1, j + 1) >= 210) && (angles[reg_indx].at<short>(i + 1, j + 1) <= 270))) { // N7(7,8,9)
					++structuralFeatureCount[7];
				}
				// Rule 9 - Corner 1
				else if (((angles[reg_indx].at<short>(i - 1, j) >= 150) && (angles[reg_indx].at<short>(i - 1, j) <= 210)) && // N2(5,6,7)
					((angles[reg_indx].at<short>(i, j + 1) >= 240) && (angles[reg_indx].at<short>(i, j + 1) <= 300))) { // N0(8,9,10)
					++structuralFeatureCount[8];
				}
				// Rule 10 - Corner 2
				else if (((angles[reg_indx].at<short>(i + 1, j) >= 150) && (angles[reg_indx].at<short>(i + 1, j) <= 210)) && // N6(5,6,7)
					((angles[reg_indx].at<short>(i, j + 1) >= 60) && (angles[reg_indx].at<short>(i, j + 1) <= 120))) { // N0(2,3,4)
					++structuralFeatureCount[9];
				}
				// Rule 11 - Corner 3
				else if (((angles[reg_indx].at<short>(i, j - 1) >= 240) && (angles[reg_indx].at<short>(i, j - 1) <= 300)) && // N4(8,9,10)
					(((angles[reg_indx].at<short>(i - 1, j) > 0) && (angles[reg_indx].at<short>(i - 1, j) <= 30)) || ((angles[reg_indx].at<short>(i - 1, j) >= 330) && (angles[reg_indx].at<short>(i - 1, j) <= 360)))) { // N2(1,0,11)
					++structuralFeatureCount[10];
				}
				// Rule 11 - Corner 4
				else if ((((angles[reg_indx].at<short>(i + 1, j) > 0) && (angles[reg_indx].at<short>(i + 1, j) <= 30)) || ((angles[reg_indx].at<short>(i + 1, j) >= 330) && (angles[reg_indx].at<short>(i + 1, j) <= 360))) && // N6(1,0,11)
					((angles[reg_indx].at<short>(i, j - 1) >= 60) && (angles[reg_indx].at<short>(i, j - 1) <= 120))) { // N4(2,3,4)
					++structuralFeatureCount[11];
				}
			}
		}

		structuralThreshold = *max_element(structuralFeatureCount, structuralFeatureCount + 12) / _structuralConstant;

		if (structuralThreshold > 0) {
			// Binarizing the structures to the feature vector
			for (int i = 0; i < STRUCTURAL_DEF; i++) {
				if (structuralFeatureCount[i] >= structuralThreshold) {
					structuralVector[reg_indx] |= 1 << i;
				}
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Extracts the Gradient feature. For each image region, determines if a number of
///				pixels above a threshold have a gradient in each of 12 sampling regions </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="angles"> A vector of Mat objects that hold the gradients for each image region </param>
/// <param name="gradientVector"> Gradient feature vector </param>
/////////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::gradientsExtraction(vector<Mat>& angles, vector<ushort>& gradientVector) {
	/// Generate grad_x and grad_y
	Mat grad_x, grad_y;

	int scale = 1;
	int delta = 0;
	int ddepth = CV_16S;

	// Direction in RAD and DEG
	double directionRAD;
	int directionDEG;

	int currentDegree = DEGREE_GAP;

	// Keeps counts of gradients in each sampling region for each image region
	int gradientCount[SAMPLING_REGIONS];
	double gradientThreshold = 0;

	for (int reg_indx = 0; reg_indx < _imageRegions.size(); reg_indx++) {
		// Zeroing the gradient count array
		for (int g = 0; g < SAMPLING_REGIONS; g++) {
			gradientCount[g] = 0;
		}

		grad_x = Mat::zeros(_imageRegions[reg_indx].rows, _imageRegions[reg_indx].cols, CV_16U);
		Sobel(_imageRegions[reg_indx], grad_x, ddepth, 1, 0, 3, scale, delta, BORDER_DEFAULT);

		grad_y = Mat::zeros(_imageRegions[reg_indx].rows, _imageRegions[reg_indx].cols, CV_16U);
		Sobel(_imageRegions[reg_indx], grad_y, ddepth, 0, 1, 3, scale, delta, BORDER_DEFAULT);

		angles[reg_indx] = Mat::zeros(_imageRegions[reg_indx].rows, _imageRegions[reg_indx].cols, CV_16U);

		for (int i = 0; i < _imageRegions[reg_indx].rows; i++) {
			for (int j = 0; j < _imageRegions[reg_indx].cols; j++) {
				directionRAD = atan2(grad_y.at<short>(i, j), grad_x.at<short>(i, j));
				// Fixing the angle in case the result is below 0
				directionDEG = (int)((directionRAD >= 0 ? directionRAD : (2*M_PI + directionRAD)) * (180 / M_PI));

				// Save the gradient at the pixel
				angles[reg_indx].at<short>(i, j) = directionDEG;
			}
		}

		for (int i = 0; i < angles[reg_indx].rows; i++) {
			for (int j = 0; j < angles[reg_indx].cols; j++) {
				// Sampling Region 0 (Gradient of 0 is when there's no gradient so we ignore it)
				if (((angles[reg_indx].at<short>(i, j) > 0) && (angles[reg_indx].at<short>(i, j) < 30)) || (angles[reg_indx].at<short>(i, j) == 360)) {
					++gradientCount[0];
				}

				for (int k = 1; k < SAMPLING_REGIONS; k++) {
					if ((angles[reg_indx].at<short>(i, j) >= currentDegree) && (angles[reg_indx].at<short>(i, j) < currentDegree + DEGREE_GAP)) {
						++gradientCount[k];
					}

					currentDegree += DEGREE_GAP;
				}

				currentDegree = DEGREE_GAP;
			}
		}

		// Calculating the threshold
		gradientThreshold = _gradientConstant * (_imageRegions[reg_indx].rows * _imageRegions[reg_indx].cols) / _imageRegions.size();

		// Binarizing the region gradients to the feature vector
		for (int i = 0; i < SAMPLING_REGIONS; i++) {
			if (gradientCount[i] >= gradientThreshold) {
				gradientVector[reg_indx] |= 1 << i;
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Calculates the x and y seperators of the image into the number of hotozintal regions
///				specified in the initialization of the class, when each horziontal division
///				needs to have approximatley the same number of foreground pixels </summary>
///
/// <remarks> Shay Yacobinski </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::calculateHorizontalSeperators() {
	// Get the width, height and mid point of the src image
	int cols_num = _image.cols;
	int rows_num = _image.rows;
	int mid = (int)floor(rows_num / 2);

	int rowMult = _yNumOfRows - 1;

	// Initial mid point regions
	Mat firstPart = _image(Rect(0, 0, cols_num, mid));
	Mat restOfImage = _image(Rect(0, mid, cols_num, rows_num - mid));
	Mat currImage = _image;

	// Number of black pixels is the total pixels of the region less the non zero pixels (anything but black)
	int firstPartBlackPixelsCount = (cols_num * mid) - countNonZero(firstPart);
	int restOfImageBlackPixelsCount = (cols_num * (rows_num - mid)) - countNonZero(restOfImage);
	int end_val = rows_num;
	int old_mid = 0;

	// First seperator is the bound
	_yRowsSeperatorsVec[0] = 0;

	// Calculate horizontal (rows) seperators
	for (int i = 1; i < _yNumOfRows; i++) {
		while ((old_mid != mid) && (firstPartBlackPixelsCount != restOfImageBlackPixelsCount)) {
			if ((firstPartBlackPixelsCount * rowMult) > restOfImageBlackPixelsCount) {
				// The end for next middle calculations is the current middle
				end_val = mid;

				// The current middle
				mid = old_mid + ((mid - old_mid) / 2);
			}
			else if (restOfImageBlackPixelsCount > (firstPartBlackPixelsCount * rowMult)) {
				// Saving the old middle for future calculations of the middle
				old_mid = mid;

				// The current middle
				mid = mid + ((end_val - mid) / 2);
			}

			// New regions
			firstPart = currImage(Rect(0, 0, cols_num, mid));
			restOfImage = currImage(Rect(0, mid, cols_num, rows_num - mid));

			// New black pixels count
			firstPartBlackPixelsCount = (cols_num * mid) - countNonZero(firstPart);
			restOfImageBlackPixelsCount = (cols_num * (rows_num - mid)) - countNonZero(restOfImage);
		}

		// Less regions for next time
		--rowMult;

		// Save the seperator
		_yRowsSeperatorsVec[i] = _yRowsSeperatorsVec[i - 1] + mid;

		cols_num = restOfImage.cols;
		rows_num = restOfImage.rows;

		// New seperator point
		mid = (int)floor(rows_num / 2);
		end_val = rows_num;
		old_mid = 0;

		// New seperator regions
		currImage = restOfImage;
		firstPart = currImage(Rect(0, 0, cols_num, mid));
		restOfImage = currImage(Rect(0, mid, cols_num, rows_num - mid));

		// New black pixels count
		firstPartBlackPixelsCount = (cols_num * mid) - countNonZero(firstPart);
		restOfImageBlackPixelsCount = (cols_num * (rows_num - mid)) - countNonZero(restOfImage);
	}

	_yRowsSeperatorsVec[_yNumOfRows] = _yRowsSeperatorsVec[_yNumOfRows - 1] + rows_num;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Calculates the x and y seperators of the image into the number of vertical regions
///				specified in the initialization of the class, when each vertical division
///				needs to have approximatley the same number of foreground pixels </summary>
///
/// <remarks> Shay Yacobinski </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::calculateVerticalSeperators() {
	// Get the width, height and mid point of the src image
	int cols_num = _image.cols;
	int rows_num = _image.rows;
	int mid = (int)floor(cols_num / 2);

	int colMult = _xNumOfColumns - 1;

	// Initial seperate point regions
	Mat firstPart = _image(Rect(0, 0, mid, rows_num));
	Mat restOfImage = _image(Rect(mid, 0, cols_num - mid, rows_num));
	Mat currImage = _image;

	// Number of black pixels is the total pixels of the region less the non zero pixels (anything but black)
	int firstPartBlackPixelsCount = (rows_num * mid) - countNonZero(firstPart);
	int restOfImageBlackPixelsCount = (rows_num * (cols_num - mid)) - countNonZero(restOfImage);
	int end_val = cols_num;
	int old_mid = 0;

	// First seperator is the bound
	_xColumnsSeperatorsVec[0] = 0;

	// Calculate horizontal (rows) seperators
	for (int i = 1; i < _xNumOfColumns; i++) {
		// Finds the middle between regions with same amount of black pixels (more or less)
		while ((old_mid != mid) && (firstPartBlackPixelsCount != restOfImageBlackPixelsCount)) {
			if ((firstPartBlackPixelsCount * colMult) > restOfImageBlackPixelsCount) {
					// The end for next middle calculations is the current middle
					end_val = mid;

					// The current middle
					mid = old_mid + ((mid - old_mid) / 2);
			}
			else if (restOfImageBlackPixelsCount > (firstPartBlackPixelsCount * colMult)) {
				// Saving the old middle for future calculations of the middle
				old_mid = mid;

				// The current middle
				mid = mid + ((end_val - mid) / 2);
			}

			// New regions
			firstPart = currImage(Rect(0, 0, mid, rows_num));
			restOfImage = currImage(Rect(mid, 0, cols_num - mid, rows_num));

			// New black pixels count
			firstPartBlackPixelsCount = (rows_num * mid) - countNonZero(firstPart);
			restOfImageBlackPixelsCount = (rows_num * (cols_num - mid)) - countNonZero(restOfImage);
		}

		// Less regions for next time
		--colMult;

		// Save the seperator
		_xColumnsSeperatorsVec[i] = _xColumnsSeperatorsVec[i - 1] + mid;

		cols_num = restOfImage.cols;
		rows_num = restOfImage.rows;

		// New seperator point
		mid = (int)floor(cols_num / 2);
		end_val = cols_num;
		old_mid = 0;

		// New seperator regions
		currImage = restOfImage;
		firstPart = currImage(Rect(0, 0, mid, rows_num));
		restOfImage = currImage(Rect(mid, 0, cols_num - mid, rows_num));

		// New black pixels count
		firstPartBlackPixelsCount = (rows_num * mid) - countNonZero(firstPart);
		restOfImageBlackPixelsCount = (rows_num * (cols_num - mid)) - countNonZero(restOfImage);
	}

	_xColumnsSeperatorsVec[_xNumOfColumns] = _xColumnsSeperatorsVec[_xNumOfColumns - 1] + cols_num;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Calculates the x and y seperators of the image into the number of regions specified
///				in the initialization of the class, when each horziontal and vertical division
///				needs to have approximatley the same number of foreground pixels </summary>
///
/// <remarks> Shay Yacobinski </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::calculateImageSeperators() {
	/* Horizontal */
	calculateHorizontalSeperators();

	/* Vertical */
	calculateVerticalSeperators();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Creates a grid of n * m regions representing the divised image </summary>
///
/// <remarks> Shay Yacobinski </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::buildImageGrid() {
	int regionIndex = 0;

	for (int y = 0; y < _yNumOfRows; y++) {
		for (int x = 0; x < _xNumOfColumns; x++) {
			_imageRegions[regionIndex] = _image(Rect(_xColumnsSeperatorsVec[x], 
													_yRowsSeperatorsVec[y], 
													(_xColumnsSeperatorsVec[x + 1] - _xColumnsSeperatorsVec[x]), 
													(_yRowsSeperatorsVec[y + 1] - _yRowsSeperatorsVec[y])));
			++regionIndex;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searchs for a horizontal stroke in the given region Mat </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="concavityThreshold"> Threshold for a legal stroke </param>
/// <param name="regionMat"> The region Mat </param>
/// <param name="regionIndex"> The region index </param>
/// <param name="strokeVector"> Large stroke feature vector </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::discoverHorizontalStroke(double concavityThreshold, Mat& regionMat, int regionIndex, vector<uchar>& strokeVector) {
	int horizonLength = 0;
	bool previousBlack = false;

	// Horizontal strokes
	for (int i = 0; i < regionMat.rows; i++) {
		horizonLength = 0;
		previousBlack = false;
			
		for (int j = 0; j < regionMat.cols; j++) {
			// Counting sequantial foreground pixels
			if ((regionMat.at<char>(i,j) == 0) && previousBlack) {
				++horizonLength;

				// New foreground pixel discoverd
			} else if (regionMat.at<char>(i,j) == 0) {
				previousBlack = true;
				horizonLength = 1;

				// Background pixel discovered that ended a sequence
			} else if (previousBlack) {
				if (horizonLength >= concavityThreshold) {
					strokeVector[regionIndex] |= 1 << LARGE_STROKE_H;
					return;
				}

				horizonLength = 0;
				previousBlack = false;
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searchs for a vertical stroke in the given region Mat </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="concavityThreshold"> Threshold for a legal stroke </param>
/// <param name="regionMat"> The region Mat </param>
/// <param name="regionIndex"> The region index </param>
/// <param name="strokeVector"> Large stroke feature vector </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::discoverVerticalStroke(double concavityThreshold, Mat& regionMat, int regionIndex, vector<uchar>& strokeVector) {
	int verticalLength = 0;
	bool previousBlack = false;

	// Horizontal strokes
	for (int j = 0; j < regionMat.cols; j++) {
		verticalLength = 0;
		previousBlack = false;

		for (int i = 0; i < regionMat.rows; i++) {
			// Counting sequantial foreground pixels
			if ((regionMat.at<char>(i,j) == 0) && previousBlack) {
				++verticalLength;

				// New foreground pixel discoverd
			} else if (regionMat.at<char>(i,j) == 0) {
				previousBlack = true;
				verticalLength = 1;

				// Background pixel discovered that ended a sequence
			} else if (previousBlack) {
				if (verticalLength >= concavityThreshold) {
					strokeVector[regionIndex] |= 1 << LARGE_STROKE_V;

					return;
				}

				verticalLength = 0;
				previousBlack = false;
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> For every white pixel in the region, run rays to 8 directions
///				in search of foreground pixels in the image (not just the region) </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="concavityThreshold"> Threshold for a legal stroke </param>
/// <param name="fromRow"> The starting row of the region </param>
/// <param name="fromColumn"> The starting column of the region </param>
/// <param name="toRow"> The ending row of the region </param>
/// <param name="toColumn"> The ending column of the region </param>
/// <param name="reg_index"> The region index </param>
/// <param name="concavityVector"> Concavity feature vector </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
void GSCExtractor::convolveRegion(double concavityThreshold, int fromRow, int fromColumn, int toRow, int toColumn, int reg_index, vector<uchar>& concavityVector) {
	// Counters for the 5 options in the region
	int rightCount = 0;
	int leftCount = 0;
	int upCount = 0;
	int downCount = 0;
	int holeCount = 0;

	// Counter for a single pixel, later to determine if the pixel participates in a hole
	int pixelHoleCount = 0;

	for (int i = fromRow; i < toRow; i++) {
		for (int j = fromColumn; j < toColumn; j++) {
			pixelHoleCount = 0;

			// If the pixel is white then it's a background pixel and we send rays from it
			if (((short) _image.at<uchar>(i,j)) == 255) {
				// Right ray
				if (reachRight(i, j)) {
					++rightCount;
					++pixelHoleCount;
				} 
				
				// Left ray
				if (reachLeft(i, j)) {
					++leftCount;
					++pixelHoleCount;
				}

				// Up ray
				if (reachUp(i, j)) {
					++upCount;
					++pixelHoleCount;
				}

				// Down ray
				if (reachDown(i, j)) {
					++downCount;
					++pixelHoleCount;
				}

				// UpRight ray
				if (reachUpRight(i, j)) {
					++pixelHoleCount;
				}

				// UpLeft ray
				if (reachUpLeft(i, j)) {
					++pixelHoleCount;
				}

				// DownRight ray
				if (reachDownRight(i, j)) {
					++pixelHoleCount;
				}

				// DownLeft ray
				if (reachDownLeft(i, j)) {
					++pixelHoleCount;
				}

				// Hole check
				if (pixelHoleCount > CONCAVITY_HOLE_THRESHOLD) {
					++holeCount;
				}
			}
		}
	}

	if (upCount >= concavityThreshold) {
		concavityVector[reg_index] |= 1 << CONCAVITY_U;
	}

	if (downCount >= concavityThreshold) {
		concavityVector[reg_index] |= 1 << CONCAVITY_D;
	}

	if (leftCount >= concavityThreshold) {
		concavityVector[reg_index] |= 1 << CONCAVITY_L;
	}

	if (rightCount >= concavityThreshold) {
		concavityVector[reg_index] |= 1 << CONCAVITY_R;
	}

	if (holeCount >= concavityThreshold) {
		concavityVector[reg_index] |= 1 << CONCAVITY_H;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel to the right of the given background pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachRight(int row, int col) {
	for (int j = col + 1; j < _image.cols; j++) {
		if (_image.at<uchar>(row,j) == 0) {
			return true;
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel to the left of the given background pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachLeft(int row, int col) {
	for (int j = col - 1; j > 0; j--) {
		if (_image.at<uchar>(row,j) == 0) {
			return true;
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel above the given background pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachUp(int row, int col) {
	for (int i = row - 1; i > 0; i--) {
		if (_image.at<uchar>(i,col) == 0) {
			return true;
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel below the given background pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachDown(int row, int col) {
	for (int i = row + 1; i < _image.rows; i++) {
		if (_image.at<uchar>(i,col) == 0) {
			return true;
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel above and to the right of the given background 
///				pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachUpRight(int row, int col) {
	int i = row - 1;
	int j = col + 1;

	while ((i > 0) && (j < _image.cols)) {
		if (_image.at<uchar>(i,j) == 0) {
			return true;
		}

		i--;
		j++;
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel below and to the right of the given background 
///				pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachDownRight(int row, int col) {
	int i = row + 1;
	int j = col + 1;

	while ((i < _image.rows) && (j < _image.cols)) {
		if (_image.at<uchar>(i,j) == 0) {
			return true;
		}

		i++;
		j++;
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel above and to the left of the given background 
///				pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachUpLeft(int row, int col) {
	int i = row - 1;
	int j = col - 1;

	while ((i > 0) && (j > 0)) {
		if (_image.at<uchar>(i,j) == 0) {
			return true;
		}

		i--;
		j--;
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary> Searches for a foreground pixel below and to the left of the given background 
///				pixel </summary>
///
/// <remarks> Shay Yacobinski </remarks>
///
/// <param name="row"> The row of the background pixels </param>
/// <param name="col"> The column of the background pixels </param>
////////////////////////////////////////////////////////////////////////////////////////////////////
bool GSCExtractor::reachDownLeft(int row, int col) {
	int i = row + 1;
	int j = col - 1;

	while ((i < _image.rows) && (j > 0)) {
		if (_image.at<uchar>(i,j) == 0) {
			return true;
		}

		i++;
		j--;
	}
	return false;
}