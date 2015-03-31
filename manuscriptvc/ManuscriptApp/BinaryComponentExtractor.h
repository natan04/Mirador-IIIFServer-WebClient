#ifndef __BinaryComponentExtractor_H_
#define __BinaryComponentExtractor_H_

#include "ComponentExtractor.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Binary component extractor class </summary>
///
/// <remarks>	El Sana, 2/15/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class BinaryComponentExtractor : public ComponentExtractor {

public:
	BinaryComponentExtractor()  {;}
	BinaryComponentExtractor(DImage *img):ComponentExtractor(img){;}
	~BinaryComponentExtractor(void) {;}

	void collectComponents(vector<vector<Point>>& contours, vector<Vec4i> hierarchy, vector<ConnectedComponent*>& component);
	void extract(vector<ConnectedComponent*>&) ;
};

#endif 
