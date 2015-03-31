#ifndef _COMPONENEXTRACTOR_H 
#define _COMPONENEXTRACTOR_H 

#include <opencv/cv.h>
#include <opencv2/core/core.hpp>

#include "ConnectedComponent.h"

class DImage ;
using namespace cv ;

class ComponentExtractor{
protected:
	DImage* _image ;

public:
	ComponentExtractor()  {;}
	ComponentExtractor(DImage* image)  {
		_image = image;
	}

	~ComponentExtractor(void) {;}

	void setImage(DImage* img) { _image = img; } 

	virtual void extract(vector<ConnectedComponent*>&) = 0 ;
};

#endif 