#include "stdafx.h"
#include "FilterAnisotropic.h"
#include "anigauss.h"
#include "ComponentExtractorBinary.h"
#include <math.h>

FilterAnisotropic::FilterAnisotropic() { ; }

//==========================================================================
//Description: The main function that applies the Anisortropic Filter.
//Returns: Pointer to a DImage holding the output of the Anisotropic Filter.
//==========================================================================
DImage* FilterAnisotropic::filter(){
	
	Mat M;
	M = findMaxResponse();
	Mat Q = eraseMargins(M);
	
	DImage* res = new DImage(Q);

	return res;
}


//=============================================================
//Description: This function erases the margins of a given Mat.
//Param: Mat instance.
//Returns: Mat instance without the margins.
//=============================================================
Mat FilterAnisotropic::eraseMargins(Mat im){

	Mat img = im.clone();
	int centralRow = (int) std::floor((double)img.rows*0.1);
	int centralColumn = (int) std::floor((double)img.cols*0.1);
	Mat res = img.rowRange(centralRow, img.rows - centralRow);

	return res;
}


//================================================================================
// Description: This function estimates the avg word size. 
// Return: a vector<int> instance with two entries:
// 1. scales[0] =  lower estimation.
// 2. scales[1] =  upper estimation.
//================================================================================
vector<double> FilterAnisotropic::wordSizeEstimation() {
	
	Mat img = (_image->getMat()).clone();
	img = eraseMargins(img);
	img.convertTo(img, CV_8UC1); //for binarization.
	Mat res;
	threshold(img, res, 0, 255, CV_THRESH_OTSU);
		
	vector<ConnectedComponent*> components;
	ComponentExtractorBinary bn;
	bn.setImage(new DImage(res));
	bn.extract(components);
	
	RNG rng(12345);
	double avg = 0;
	double stdDev = 0;
	
	for (int i = 0; i < (int)components.size(); i++){		
		avg += components[i]->getBoundRect().height;
	}

	avg = avg / (int)components.size();

	for (int i = 0; i < (int)components.size(); i++){
		Rect r = components[i]->getBoundRect();
		stdDev += abs(r.height - avg);	
	}

	stdDev = (double)sqrt(stdDev / (int)components.size());

	vector<double> scales;
	scales.push_back(avg);
	scales.push_back(avg+stdDev);
	return scales;
}



//===============================================================
// Description:Finds the Max Response of a filtered matrix.
// Return: Mat instance that holds the max response after Anisotropic Filter at each pixel.
//===============================================================
Mat FilterAnisotropic::findMaxResponse(){
	
	Mat M = (_image->getMat()).clone();
	M.convertTo(M, CV_64FC1);
	Mat max_response(M.rows, M.cols, CV_64FC1);
	double * ptr = M.ptr<double>(0);
	

	int theta = 0;
	int eta = 3;
	int scale = 1;
	
	vector<double> scales = wordSizeEstimation();
	
	//storing all the responses for each scale given.
	vector<Mat> response_arr;
	
	for (double i = scales[0]; i < scales[1]; i++){
		Mat response = applyFilter(ptr, Size(M.cols, M.rows), theta, i, eta);
		response_arr.push_back(response);
	}

	//finding the maximum response for each pixel.
	
	for (int k = 0; k < (int)M.rows; k++) {
		for (int m = 0; m < (int)M.cols; m++) {
			double max_res = response_arr[0].at<double>(k, m);
			for (int j = 0; j < (int)response_arr.size(); j++){
				if (response_arr[j].at<double>(k, m) > max_res)
					max_res = response_arr[j].at<double>(k, m);
			}
			max_response.at<double>(k, m) = max_res;
		}
	}
	return max_response;
}

//==================================================================
//Description: Applys Anisotropic filter to a given image.
//Param: 
//1. double*I - input/output matrix.
//2. Size sz - Size of input/output Matrix.
//3. double theta - the for the filter.
//4. double scale - scale of filter (given by lineSizeEstimation()).
//5. double eta - angle for the filter.
//Returns: Mat instance - the output of the Anistropic filter.
//===================================================================
Mat FilterAnisotropic::applyFilter(double* I, Size sz, double theta, double scale, double eta){
	anigauss(I, I, sz.width, sz.height, scale,scale * 3, theta, 2, 0);
	Mat res(sz.height, sz.width, CV_64FC1, I);
	return res;
}


