#ifndef _CONNECTEDCOMPONENT_H 
#define _CONNECTEDCOMPONENT_H

#include <vector>
#include <string>
#include "Contour.h" 

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Connected component. </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

class ConnectedComponent {
	const static int ABOVE =  1 ;
	const static int BELOW = -1 ;
	const static int BORDER = 1 ;
	const static int VERTEX = 2 ;
	const static int ON_EDGE = 3 ;

protected:
	Mat                   _image   ;
	ConnectedComponent*   _parent  ;
	Contour               _contour ;
	String                _string  ;
	vector<ConnectedComponent*> _children ;

public:
	ConnectedComponent(vector<Point>& contour);
	ConnectedComponent(void);
	~ConnectedComponent(void);

	void setImage(Mat img)       { _image = img;  }
	void setImage(Mat img, Rect& rect){
		_image = img(rect);
	}

	Mat      getImage()          { return _image ; } 
	Contour& getContour()        { return _contour ;}

	void addChild(ConnectedComponent* component) ;
	Rect                         getBoundRect()   { return _contour.getBoundRect(); }
	ConnectedComponent*          getParent()      { return _parent; }
	vector<ConnectedComponent*>& getChildren()    { return _children; }

	int  borderType(Mat mat, int row, int col, char mask, int& trace );
	void setParent(ConnectedComponent* parent)        { _parent   = parent; }
	void fillComponentOnMat(Mat mat, char mask, char filler);
	void draw(Mat img, Scalar clr, bool isclosed, int thickness, int line_type);
};

#endif 