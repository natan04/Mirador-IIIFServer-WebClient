#include "stdafx.h"
#include "TextLineExtractorProfileSeam.h"
#include "DImage.h"
#include "ProjectionProfile.h"
#include <math.h>


TextLineExtractorProfileSeam::TextLineExtractorProfileSeam(ProjectionProfile proj, DImage* prof, Mat img) {
	
	_image = img;
	_projector = proj;
	_profile = prof;

}

//Description: This function splits the image vertically to k vertical devisions then projects each seam and stores it in an array. 
std::vector<DImage> TextLineExtractorProfileSeam::createVerticalDevision(int k, int projectionMethod) {

	std::vector<DImage> array;
	Mat m = _image;
	
	int w = (int)(m.cols / k); 
	ProjectionProfile proj(projectionMethod);

	for (int i = 0; i < k; i++) {
		DImage* col_img = DImage(m.colRange(i*w, i*w + w)).project(proj); 
		array.push_back(*col_img); 
	}

	return array;
}

// Description: This function is for debugging.
void TextLineExtractorProfileSeam::MedialSeamDrawing(){
	std::vector<Extremum> arr = _projector.findMinimumMaximum(_profile);

	for (int i = 0; i < (int)arr.size(); i++) {
		if (arr[i].second == false) {
			Point2i start(0, arr[i].first.x);
			Point2i end(_image.cols - 1, arr[i].first.x);
			line(_image, start, end, 0, 10);
		}
	}
}	


// Description: This function returns a derivative Matrix (using Sobel derivative) of the given image.
Mat TextLineExtractorProfileSeam::computeDerivative(){
	Mat img;
	_image.copyTo(img);
	Mat gradiant_mat;
	int scale = 2;
	int delta = 0;
	int ddepth = CV_16S;
	
	GaussianBlur(img, img, Size(11, 11), 0, 0, BORDER_DEFAULT);
	
	Mat grad_x, grad_y;
	Mat abs_grad_x, abs_grad_y;
	
	Sobel(img, grad_x, ddepth, 1, 0, 11, scale, delta, BORDER_DEFAULT);
	convertScaleAbs(grad_x, abs_grad_x);
	Sobel(img, grad_y, ddepth, 0, 1, 11, scale, delta, BORDER_DEFAULT);
	convertScaleAbs(grad_y, abs_grad_y);
	/// Total Gradient (approximate)
	addWeighted(abs_grad_x, 0.5, abs_grad_y, 0.5, 0, gradiant_mat);

	return gradiant_mat;
}



//==========================================================================================
// Description: This function computes the seperating seams:
// Returns: vector instance - a vector holding each sep seams row along the line.
//==========================================================================================
vector<vector<int>> TextLineExtractorProfileSeam::computeSeperatingSeams(){
	
	Mat energy_map;
	vector<Extremum> Lines;
	vector<Extremum> temp = _projector.findMinimumMaximum(_profile);
	vector<vector<int>> sep_seam_vector;
	transpose(computeDerivative(),energy_map);
	int n = energy_map.rows;
	
	for (int i = 0; i < (int)temp.size(); i++) {
		if (temp[i].second == true) {
			Lines.push_back(temp[i]);
		}
	}
	int l = (int)Lines.size();
	
	for (int k = 1; k < l - 1; k++){
		//apply constrained seam carving for each pair of text lines:

		int L_a = Lines[k].first.x;
		int L_b = Lines[k + 1].first.x;


		for (int row = 1; row < n; row++) {
			for (int col = L_a; col < L_b; col++) {
				//Defining the bounderies upon which to find the minimum value seams.
				int left = std::max(col - 1, L_a);
				int right = std::min(col + 1, L_b);
				double minpath,max;
				Mat last_row = energy_map.operator()(Range(row - 1, row), Range(left, right));
				minMaxLoc(last_row, &minpath, &max);
				energy_map.at<uchar>(row, col) = energy_map.at<uchar>(row, col) + (uchar)minpath;
				}	
			}

		//now we trace the optimal seam backwards starting at the top.
		vector<int> arr;
		double min_val;
		int min_index[2];
		Mat temp_last_row = energy_map.operator()(Range(n - 2, n - 1), Range(L_a, L_b));
		
		minMaxIdx(temp_last_row, &min_val, 0, min_index);
		min_index[1] = L_a + min_index[1] - 1;

		
		//The index of the minimum point is (min_index[1],r).
		//backtrack through the energy map from bottom to top:
		
		for (int r = n-2; r >= 1; r--) {
			
			int left = std::max(min_index[1] - 5, L_a);
			int right = std::min(min_index[1] + 5, L_b);
			temp_last_row = energy_map.operator()(Range(r - 1, r), Range(left, right));
			minMaxIdx(temp_last_row, &min_val,0,min_index);
		
			min_index[1] = min_index[1] + L_a - 1;
				arr.push_back(min_index[1]);
		}
		sep_seam_vector.push_back(arr);
	}
		
	return sep_seam_vector;
}
	

//================================================================================================================
//Description: Text Line extraction method based on "Separating Seam Carving".
//Return: Extracted text lines from document.
//================================================================================================================
void TextLineExtractorProfileSeam::extract(){
	vector<vector<int>> sep_seams = computeSeperatingSeams();
	vector<std::pair<DImage,double>> lines_vector;
	
	int l = (int)sep_seams.size();
	double max_elem,min,min_elem;
	double avg=0;
	// Finding the min and max points on each pair of "neighbouring" seams: 
	for (int i = 0; i < l-1; i++) {

			ProjectionProfile projector;
			minMaxLoc(sep_seams[i],&min_elem);
			minMaxLoc(sep_seams[i + 1],&min,&max_elem);
	
			Mat line = _image.rowRange((int)min_elem, (int)max_elem);			
			
			DImage * profile = DImage(line).project(projector); // finding each line's projection profle.
			
			for (int j = 0; j < 10; j++)
				projector.smoothProfile(profile->getMat());

			avg += projector.getWeight(profile,0);
			lines_vector.push_back(std::pair<DImage,double>(DImage(line), projector.getWeight(profile,0)));
			projector.drawProfile(&DImage(line),profile,500);
			
			//namedWindow("line number: " + std::to_string(i), cv::WINDOW_NORMAL | CV_WINDOW_KEEPRATIO);
			//imshow("line number: " + std::to_string(i), line);
		}

	avg = avg / l; //weight avg;
	// Post Processing: 
	
	for (int j = 0; j < (int)lines_vector.size(); j++) {
		if (lines_vector[j].second < avg)
			lines_vector.erase(lines_vector.begin()+j);
	}

	for (int k = 0;k < (int)lines_vector.size(); k++) {
		namedWindow("line number: " + std::to_string(k), cv::WINDOW_NORMAL);
		imshow("line number: " + std::to_string(k), lines_vector[k].first.getMat()); 

	}
	
	
}
 


