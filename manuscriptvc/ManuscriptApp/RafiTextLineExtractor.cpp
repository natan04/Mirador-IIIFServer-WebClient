#include "stdafx.h"
#include "RafiTextLineExtractor.h"
#include "ComponentExtractorBinary.h"
#include "FilterAnisotropic.h"
#include "DImage.h"
#include "OtsuBinarizer.h"
#include "opencv\highgui.h"
using namespace cv;

RafiTextLineExtractor::RafiTextLineExtractor(){;}

BinaryComponentTree RafiTextLineExtractor::buildComponentTree(){

	Mat im_original = _image.clone();

	Mat im_filtered = filterDocument();
	
	BinaryComponentTree t;

	// Should Consider a function to compute the INTERVAL
	const int INTERVAL = 25;

	// Build Tree Structure;
	for (int i = 255; i > 0; i = i - INTERVAL){

		Mat floatGray, norm, res;
		im_filtered.convertTo(floatGray, CV_32FC1);

		vector<ConnectedComponent*> component_list;

		cv::normalize(floatGray, norm, 0, 255, NORM_MINMAX, CV_8UC1);

		threshold(norm, res, i, 255, CV_THRESH_BINARY_INV); // binarize.
		
		// Debug:
		namedWindow("THS " +to_string(i), CV_WINDOW_NORMAL);
		imshow("THS " + to_string(i), res);
		
		DImage* binary_response = new DImage(res);

		// Extarct the connected components from the binary image 
		ComponentExtractorBinary component_extractor;
		binary_response->extractComponents(component_extractor, component_list);

		// Add new tree layer for each components in the given threshold:
		for (int j = 0; j < component_list.size(); j++){
			t.insert(new BinaryComponentNode(component_list[j]));
		}
		
	}

	return t;
}

double RafiTextLineExtractor::computeOrientation(vector<Point> &pts, Mat &img)
{
	//Construct a buffer used by the pca analysis
	Mat data_pts = Mat(pts.size(), 2, CV_64FC1);
	for (int i = 0; i < data_pts.rows; ++i)
	{
		data_pts.at<double>(i, 0) = pts[i].x;
		data_pts.at<double>(i, 1) = pts[i].y;
	}

	//Perform PCA analysis
	PCA pca_analysis(data_pts, Mat(), CV_PCA_DATA_AS_ROW);

	//Store the position of the object
	Point pos = Point(pca_analysis.mean.at<double>(0, 0), pca_analysis.mean.at<double>(0, 1));

	//Store the eigenvalues and eigenvectors
	vector<Point2d> eigen_vecs(2);
	vector<double> eigen_val(2);
	for (int i = 0; i < 2; ++i)
	{
		eigen_vecs[i] = Point2d(pca_analysis.eigenvectors.at<double>(i, 0),	pca_analysis.eigenvectors.at<double>(i, 1));

		eigen_val[i] = pca_analysis.eigenvalues.at<double>(i, 0);
	}

	// Draw the principal components
	circle(img, pos, 3, CV_RGB(255, 0, 255), 2);
	line(img, pos, pos + 0.02 * Point(eigen_vecs[0].x * eigen_val[0], eigen_vecs[0].y * eigen_val[0]), CV_RGB(255, 255, 0));
	line(img, pos, pos + 0.02 * Point(eigen_vecs[1].x * eigen_val[1], eigen_vecs[1].y * eigen_val[1]), CV_RGB(0, 255, 255));

	return atan2(eigen_vecs[0].y, eigen_vecs[0].x);
}



//=================================================================
// Description: Traversing the tree to find lines.
// Return: vector<ConnectedComponent*> containing Lines.
//=================================================================
vector<ConnectedComponent*> RafiTextLineExtractor::TraverseTree() {
	
	BinaryComponentTree t = buildComponentTree();
	vector<ConnectedComponent*> result;

	FilterAnisotropic fl;
	Mat img = _image.clone();
	fl.setImage(new DImage(img));

	vector<double> wordSizeEst = fl.wordSizeEstimation();
	
	BinaryComponentNode* root = t.getRoot();
	
	recursiveTraversal(root, result, wordSizeEst[1]);

	img = fl.eraseMargins(img);

	Mat color;
	cvtColor(img, color, CV_GRAY2BGR);
	RNG rng(12345);
	int contourAreaSum = 0;
	for (int i = 0; i < result.size(); i++){
		contourAreaSum += contourArea(result[i]->getContour().getPoints());	
	}

	contourAreaSum = contourAreaSum / (int) result.size();
	
	cout << contourAreaSum;
	
	for (int i = 0; i < result.size(); i++){
		if (contourArea(result[i]->getContour().getPoints()) >= contourAreaSum){
			result[i]->draw(color, Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255)), true, 5, 0);
		}
	}

	namedWindow("result", CV_WINDOW_NORMAL);
	imshow("result", color);
	color.release();
	return result;
}

//=========================================================================
// Description: Recursive Traversal Function.
//=========================================================================
void RafiTextLineExtractor::recursiveTraversal(BinaryComponentNode* current_node, vector<ConnectedComponent*>& result, double wordSizeEst){
	
	vector<BinaryComponentNode*> children = current_node->getChildren();
	Rect c = current_node->getComponent()->getBoundRect();
	if (c.height > 3*wordSizeEst){
		if (children.size() > 0){
			for (int i = 0; i < children.size(); i++){
				recursiveTraversal(children[i], result, wordSizeEst);
			}
		}
	}
	else result.push_back(current_node->getComponent());
}



//======================================================================
// Description: This function applys the Scale-Space Anisotropic filter.
// Return: A filtered image as Mat instance.
//=======================================================================
Mat RafiTextLineExtractor::filterDocument(){
	FilterAnisotropic fl;
	Mat img = _image.clone();
	DImage* tmp = new DImage(img);
	fl.setImage(tmp);
	DImage* filterd_img =  tmp->filter(fl);	
	return filterd_img->getMat();
}

//===================================================================================================================
//Description: This function extracts text lines form a page-
//Based on the article: "Using Scale-Space Anisotropic Smoothing for Text Line Extraction in Historical Documents."
//===================================================================================================================
void RafiTextLineExtractor::extract(){
	vector<ConnectedComponent*> result = TraverseTree();
}