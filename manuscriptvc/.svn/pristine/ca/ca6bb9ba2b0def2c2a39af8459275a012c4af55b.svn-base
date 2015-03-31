#ifndef _Contour_H 
#define _Contour_H 

#include <vector>
#include <opencv\cv.h> 
#include <opencv2\core\core.hpp>

using namespace std ;
using namespace cv ;

typedef pair<int, float>         VertexWeight;
typedef pair<Point2f, Point2f>   Orientation ;

class Contour {
protected:
	vector<Point> _points ;
	Rect          _brect  ;
	Point2f       _center ;
	Orientation   _orientation ;
	vector<VertexWeight>  _heap ;
public:
	Contour(void)  {;}
	~Contour(void) {;}

	vector<Point>& getPoints(){
		return _points ;
	}

	Rect&  getBoundRect() {
		return _brect ;
	}

	float inside(Point p){
		return (float)pointPolygonTest(_points, p, false);
	}

	Orientation getOrientation() { return _orientation; } 
	void  setCenter() ;
	Point getCenter()            { return _center ; } 

	void setPoints(vector<cv::Point> p){
		_points = p ;
	}

	Mat   getMat(vector<Point>& pts);
	void  setBoundRect();
	void  setOrientation() ;
	float getImportance(int i);
	int   getLeastImportant();
	void  removeVertex(int i);
	int   removeLeastImportant() ;

	Contour translate(Point shift);
	Contour translateToOrigin();
	void  drawOnImage(Mat mat, char filler);
	float getArea();
	Mat   getMask();

	// Debug 
	void print();
};

#endif 