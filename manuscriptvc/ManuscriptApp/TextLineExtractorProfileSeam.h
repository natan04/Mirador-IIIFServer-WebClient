#ifndef _PROFILE_SEAM_TEXTLINE_EXTRACTOR_H_ 
#define _PROFILE_SEAM_TEXTLINE_EXTRACTOR_H_ 

#include "TextLineExtractor.h"	
#include "ProjectionProfile.h"
class DImage ;


class TextLineExtractorProfileSeam :public TextLineExtractor {
	ProjectionProfile _projector;
	DImage* _profile;
	std::vector<DImage> createVerticalDevision(int k, int projectionMethod);
	Mat computeDerivative();
	
public:
	vector<vector<int>> computeSeperatingSeams();
	void MedialSeamDrawing(); // for testing purposes.
	TextLineExtractorProfileSeam(ProjectionProfile proj, DImage* prof, Mat img);
	~TextLineExtractorProfileSeam(){ ; }
	void extract();
};

#endif