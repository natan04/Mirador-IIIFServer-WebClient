#include "stdafx.h"
#include "DImage.h"
#include "ImageTools.h"
#include "BinaryComponentExtractor.h"

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Collect components. </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
///
/// <param name="contours">  	[in] The contours. </param>
/// <param name="hierarchy"> 	[in] The hierarchy. </param>
/// <param name="components">	[out] the collected components. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

void BinaryComponentExtractor::collectComponents(vector<vector<Point>>& contours, vector<Vec4i> hierarchy, 
	vector<ConnectedComponent*>& components){

	// Generate all the components 
	vector<vector<Point>>::iterator iter; 
	for ( iter = contours.begin(); iter != contours.end(); iter++ ){
		ConnectedComponent* component = new ConnectedComponent(*iter);
		component->setImage(_image->getMat(), component->getBoundRect());
		components.push_back(component);
	}

	// Scan the the component and build the hierarchy 
	for ( unsigned int i = 0 ; i < components.size(); i++ ){
		ConnectedComponent* component = components[i];
		// Child
		if (hierarchy[i][2] >= 0 ){
			component->addChild(components[hierarchy[i][2]]);
		}

		// Parent 
		if (hierarchy[i][3] >= 0 )
			component->setParent(components[hierarchy[i][3]]);	
	}

	// Remove from the top level components that have parents (not null)
	unsigned int i = 0 ;
	while ( i < components.size() ){
		if ( components[i]->getParent() )
			components.erase(components.begin() + i );
		else 
			i++ ;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/// <summary>	Extracts the given components. </summary>
///
/// <remarks>	El Sana, 2/9/2012. </remarks>
///
/// <param name="components">	[in,out] the extracted components. </param>
////////////////////////////////////////////////////////////////////////////////////////////////////

void  BinaryComponentExtractor::extract(vector<ConnectedComponent*>& components){
	vector<vector<Point>> contours;
	vector<Vec4i> hierarchy;
	Mat mat = _image->getMat().clone();

	cv::findContours(mat, contours, hierarchy, CV_RETR_TREE, CV_CHAIN_APPROX_NONE, Point(0, 0) );
	collectComponents(contours, hierarchy, components);
}