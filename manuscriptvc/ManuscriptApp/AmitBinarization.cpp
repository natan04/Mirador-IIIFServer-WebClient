#include "StdAfx.h"
#include "AmitBinarization.h"
#include "DImage.h"
#include "BinarizerNiblack.h"
using namespace std;

AmitBinarization::AmitBinarization(void){
	;
}


AmitBinarization::~AmitBinarization(void){
	;
}


float AmitBinarization::mStrokeWidthCalc(Mat mat, int x, int y){
	int i, j;
	float res = 0;
	this->setSW(1);
	for (i = this->getSW() * -1; i <= this->getSW(); i++){
		for (j = this->getSW() * -1; j <= this->getSW(); j++){
			//		cout << static_cast<int>(mat.at<char>(2, 1)) << endl;
			if (((x - i >= 0) && (y - j >= 0)) && ((x - i <= 2) && (y - j <= 2))){
				//	cout << x - i << " , " << y - j << endl;
				res = res + static_cast<int>(mat.at<char>(x - i, y - j)); // TODO check if it is good!
			}
		}
	}

	int base = (2 * this->getSW()) + 1;
	return (res / (pow(base, 2)));
}

int* AmitBinarization::setInFirstArr(Mat *im, int x, int y) {
	int pxl1[8] = { 0 };
	//pxl1[0] = im.at<char>(x, y);
	pxl1[0] = im->at<char>(x, y - 1);
	pxl1[1] = im->at<char>(x - 1, y + 1);
	pxl1[2] = im->at<char>(x, y + 1);
	pxl1[3] = im->at<char>(x + 1, y + 1);
	pxl1[4] = im->at<char>(x + 1, y);
	pxl1[5] = im->at<char>(x + 1, y - 1);
	pxl1[6] = im->at<char>(x, y - 1);
	pxl1[7] = im->at<char>(x - 1, y - 1);
	return pxl1;
}
int* AmitBinarization::setInSecArr(Mat *im, int x, int y){
	int pxl1[8] = { 0 };
	pxl1[0] = im->at<char>(x + 1, y);
	pxl1[1] = im->at<char>(x + 1, y - 1);
	pxl1[2] = im->at<char>(x, y - 1);
	pxl1[3] = im->at<char>(x - 1, y - 1);
	pxl1[4] = im->at<char>(x - 1, y);
	pxl1[5] = 0;
	pxl1[6] = 0;
	pxl1[7] = 0;
	return pxl1;
}
void AmitBinarization::structuralContrast(Mat im, Mat out)
{
	int* pxl1;
	int* pxl2;
	int i, j, k, l, m;
	float currmax = -10;
	float tmp = 0;
	float tmp1 = 0;
	float tmp2 = 0;
	float pxlSc;
	Mat subMat;
	Rect rec;
	for (j = 1; j < im.cols - 4; j++){
		for (k = 1; k <im.rows - 4; k++){
			pxlSc = 0;
			currmax = 0;
			subMat = im(Rect(j - 1, k - 1, 3, 3));
			tmp = min(static_cast<int>(subMat.at<char>(0, 1)), min(static_cast<int>(subMat.at<char>(0, 0)), static_cast<int>(subMat.at<char>(2, 1))));
			tmp1 = min(static_cast<int>(subMat.at<char>(0, 0)), min(static_cast<int>(subMat.at<char>(1, 0)), static_cast<int>(subMat.at<char>(2, 2))));
			tmp2 = min(static_cast<int>(subMat.at<char>(1, 0)), min(static_cast<int>(subMat.at<char>(2, 0)), static_cast<int>(subMat.at<char>(1, 2))));
			currmax = min(tmp, min(tmp1, tmp2));
			pxlSc = currmax - static_cast<int>(im.at<char>(k, j));
			out.at<char>(k, j) = pxlSc;
		}
	}

}

int AmitBinarization::mMin(Mat im, int x, int y){
	int i;
	int j;
	float result = 1000;
	float tmp;
	float tmp1;
	float tmp2;
	tmp = mStrokeWidthCalc(im, 0, 0);
	tmp1 = mStrokeWidthCalc(im, 1, 1);
	tmp2 = mStrokeWidthCalc(im, 1, 2);
	return min(tmp, (min(tmp1, tmp2)));
}
int AmitBinarization::mMax(Mat im, int x, int y){
	int i;
	int j;
	float result = -1000;
	float tmp;
	float tmp1;
	float tmp2;
	float tmp3;
	int maxi;
	tmp = mStrokeWidthCalc(im, 2, 2);
	tmp1 = mStrokeWidthCalc(im, 1, 2);
	tmp2 = mStrokeWidthCalc(im, 2, 0);
	tmp3 = mStrokeWidthCalc(im, 1, 0);
	maxi = max(tmp, max(tmp1, max(tmp2, tmp3)));
	return max(mMin(im, 0, 0), maxi);
}

void AmitBinarization::structuralContrastNorm(Mat im, Mat out)
{
	int i, j;
	int up;
	float down;
	Mat sub;
	for (i = 1; i < im.cols - 4; i++){
		for (j = 1; j < im.rows - 4; j++){
			sub = im(Rect(i - 1, j - 1, 3, 3));
			up = mMin(sub, 0, 0) - static_cast<int>(im.at<char>(j, i));
			down = mMax(sub, 0, 0) + static_cast<int>(im.at<char>(j, i)); // need to add Epsilon! important!!
			if (down == 0){
				down = down + 0.1;
				out.at<char>(j, i) = up / down;
			}
			else{ out.at<char>(j, i) = up / down; }
		}
	}

}

void AmitBinarization::structuralContrastComb(Mat scImg, Mat scNormImg, Mat result)
{
	int i, j;
	int first;
	int second;
	float power = 2.5; //TODO : ask if it is OK or need to be taken as a parameter.
	int gamma = 1; // TODO : ask if it is OK or need to be taken as a parameter.
	float alpha = pow((gamma / 128), power);
	for (i = 0; i < scNormImg.rows; i++){
		for (j = 0; j < scNormImg.cols; j++){
			first = alpha * scNormImg.at<char>(i, j);
			second = (1 - alpha) * scImg.at<char>(i, j);
			result.at<char>(i, j) = first + second;
		}
	}
}

void AmitBinarization::structuralContrastMult(Mat scCombImg, Mat scNormImg, Mat result)
{
	int i, j;
	int first;
	for (i = 0; i < scNormImg.rows; i++){
		for (j = 0; j < scNormImg.cols; j++){
			result.at<char>(i, j) = scCombImg.at<char>(i, j) + scNormImg.at<char>(i, j);
		}
	}
}

void AmitBinarization::binarizationProcess(Mat niBlack, Mat Mult, Mat img, Mat output)
{

}

void AmitBinarization::postProcessing(Mat weak, Mat output)
{
	DImage* img = new DImage(weak);
	ComponentExtractorBinary binar;
	vector<ConnectedComponent*> component_list;
	// Extarct the connected components from the binary image 
	ComponentExtractorBinary component_extractor;
	img->extractComponents(component_extractor, component_list);
	int i, j;
	for (i = 0; i < weak.rows; i++){
		for (j = 0; j < weak.cols; j++){
			output.at<char>(i, j) = weak.at<char>(i, j);
		}
	}

}

void AmitBinarization::reconstruction(Mat weakImg, Mat strongImg, Mat finalResult)
{
	int i, j;
	int k;
	DImage* img = new DImage(weakImg);
	ComponentExtractorBinary binar;
	vector<ConnectedComponent*> component_list;
	// Extarct the connected components from the binary image 
	ComponentExtractorBinary component_extractor;
	img->extractComponents(component_extractor, component_list);
	Vector<Contour> cont;

	for (i = 0; i < strongImg.rows; i++){
		for (j = 0; j < strongImg.cols; j++){

			for (k = 0; k < component_list.size(); k++){
				if (component_list.at(k)->getContour().inside(Point(i, j)) >= 0){ // check why not working
					finalResult.at<char>(i, j) = static_cast<int>(strongImg.at<char>(i, j));
				}
				else{ finalResult.at<char>(i, j) = 1; 
				}

				}
			//if the pixel is coneected to a component then finalResult.at<char>(i,j) = strongImg.at<char>(i,j)
			// else finalResult.at<char>(i,j) = 1;
		//	}
		}
	}
}

DImage* AmitBinarization::binarize(){
	Mat img = _image->getMat();
	Mat leftImg = _image->getMat(); // Strong img
	Mat rightImg = _image->getMat(); // weak img
	Mat scImage = _image->getMat();
	Mat scNormImage = _image->getMat();
	Mat scCombImage = _image->getMat();
	Mat scMultImage = _image->getMat();
	Mat BPStrongImage = _image->getMat();
	Mat BPWeakImage = _image->getMat();
	Mat AfterPPWeakImg = _image->getMat();
	Mat result = _image->getMat();
	//niblackCalc(img, leftImg, 60, 60, -0.8, 128);
	//niblackCalc(img, rightImg, 60, 60, -0.1, 128);
	niBlack.niblackCalc(img, leftImg, 60, 60, -0.8, 128);
	niBlack.niblackCalc(img, leftImg, 60, 60, -0.1, 128);
	structuralContrast(img, scImage);
	structuralContrastNorm(img, scNormImage);
	structuralContrastComb(scImage, scNormImage, scCombImage);
	structuralContrastMult(scCombImage, scNormImage, scMultImage);
	/*binarizationProcess(rightImg, scMultImage, img, BPWeakImage);
	binarizationProcess(leftImg, img, scImage, BPStrongImage);*/
	postProcessing(BPWeakImage, AfterPPWeakImg);
	reconstruction(AfterPPWeakImg, BPStrongImage, result);
	return new DImage(scMultImage);
}