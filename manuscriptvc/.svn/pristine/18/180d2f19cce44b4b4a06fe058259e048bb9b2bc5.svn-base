#include "stdafx.h"
#include "ConnectedComponent.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Constructor. </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
///
/// <param name="contour">	[in] The contour of the connected component. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

ConnectedComponent::ConnectedComponent(vector<Point>& contour){
	_contour.getPoints().insert(_contour.getPoints().begin(), contour.begin(), contour.end());
	_contour.setBoundRect();
	_parent = 0 ;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Default constructor. </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
////////////////////////////////////////////////////////////////////////////////////////////////////

ConnectedComponent::ConnectedComponent(void){
	_parent = 0 ;
}


ConnectedComponent::~ConnectedComponent(void){

}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Adds a child component. A child component is a component inside the current one </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
///
/// <param name="component">	[in] the component. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

void ConnectedComponent::addChild(ConnectedComponent* component) { 
	component->setParent(this);
	_children.push_back(component); 
}


int ConnectedComponent::borderType(Mat mat, int row, int col, char mask, int& trace ){
	bool below = mat.at<char>(row-1, col) == mask || mat.at<char>(row-1, col-1) == mask || mat.at<char>(row-1, col+1) == mask ;
	bool above = mat.at<char>(row+1, col) == mask || mat.at<char>(row+1, col-1) == mask || mat.at<char>(row+1, col+1) == mask ;
	if ( mat.at<char>(row, col-1) != mask ){
		if ( mat.at<char>(row, col+1) != mask ) {
			if ( above && below )
				return BORDER ;
			if ( above || below )
				return VERTEX ;
			return ON_EDGE ;
		}
		else {
			if ( mat.at<char>(row+1, col) == mask || mat.at<char>(row+1, col-1) == mask )
				trace = ABOVE ;
			if ( mat.at<char>(row-1, col) == mask || mat.at<char>(row-1, col-1) == mask )
				trace = BELOW ;
			return ON_EDGE ;
		}
	}
	else {
		if ( mat.at<char>(row, col+1) != mask ) {
			if ( trace == ABOVE ) {
				if ( above ) {
					trace = 0 ;
					return VERTEX ;
				}
				if ( below ) {
					trace = 0 ;
					return BORDER ;
				}
			}
			if ( trace == BELOW ) {
				if ( above ) {
					trace = 0 ;
					return BORDER ;
				}
				if ( below ) {
					trace = 0 ;
					return VERTEX ;
				}
			}
		}
		else 
			return ON_EDGE ;
	}
	// this should not be reached. 
	return 0 ;
}

void ConnectedComponent::fillComponentOnMat(Mat mat, char mask, char filler){
	Rect rect  = _contour.getBoundRect() ;
	int width  = rect.x + rect.width ;
	int height = rect.y + rect.height ;
	bool inside = false ;    
	bool onborder = false ;
	int trace = 0 ;
	for( int y = rect.y ; y <= height; y++){
		for( int x = rect.x ; x <= width; x++){
			if ( mat.at<char>(y,x) == mask ){
				switch ( borderType(mat, y, x, mask, trace)){
				case BORDER:
					inside = !inside ;
					break ;

				case ON_EDGE:
					onborder = true ;
					
				default: ;
				}
			}
			else if ( inside ) {
				mat.at<char>(y,x) = filler ;
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Draws. </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
///
/// <param name="img">			The image. </param>
/// <param name="clr">			The colour. </param>
/// <param name="isclosed"> 	true if isclosed. </param>
/// <param name="thickness">	The thickness. </param>
/// <param name="line_type">	Type of the line. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

void ConnectedComponent::draw(Mat img, Scalar clr, bool isclosed, int thickness, int line_type){
	vector<vector<Point>> contours ;
	contours.push_back(_contour.getPoints());
	polylines(img, contours, isclosed, clr, thickness, line_type);
}