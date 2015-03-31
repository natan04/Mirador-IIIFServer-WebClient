#ifndef _PROJECTOION_PROFILE_H_ 
#define _PROJECTOION_PROFILE_H_ 

#include "ImageProjector.h"
#include "ImageTools.h"
using namespace cv ;
using namespace std ;

typedef pair<Point2i, bool> Extremum ; 

class ProjectionProfile : public ImageProjector {
protected:
	double getProfileSum(DImage* profile);
	double getPeakValleySum(DImage* profie);
	
public:
	const static int WS_SUM = 0;
	const static int WS_PEAK_VALY_DIFF = 1;

	ProjectionProfile(){
		_direction = 0 ;
		_mode = MODE_SUM ;
	}

	ProjectionProfile(int mode ){
		_mode = mode ;
		_direction = 0 ;
	}

	~ProjectionProfile(void){;}

	void smoothProfile(Mat profile){
		float f[] = {0.2f, 0.2f, 0.2f, 0.2f, 0.2f} ;
		Mat filter(5,1,CV_32F, f);
		ImageTools::smoothColumn(profile, filter, 0);
	}

	void drawProfile(DImage* img, DImage* profile, int width);
	vector<Extremum> findMinimumMaximum(DImage* profile);
	// This function return a weight for each Projection Profile, with proportion to the scew 
	// The prfile is one column images
	double getWeight(DImage* profile, int scheme); 
	DImage* project() ;
};

#endif 