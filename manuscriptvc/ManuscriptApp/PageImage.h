#ifndef _PAGE_IMAGE_H_ 
#define _PAGE_IMAGE_H_


#include <iostream>
#include <vector>
#include "DImage.h"

using namespace std ;

class PageImage : DImage {
	DImage*          _main ;
	DImage*          _margins ;
	vector<DImage*>  _marginNotes ;

public:
	PageImage(void);
	~PageImage(void);
	
	void setMainFragment(DImage* dimg){
		_main = dimg ;
		_main->setLabel(DImage::DI_LABEL_PAGE_MAIN);
	}
	
	DImage* getMainFragment(){
		return _main ;
	}

	void addMarginNote(DImage* dimg){
		_marginNotes.push_back(dimg);
	}

	void extractMarginNotes() ;
	//int analyseLayout(PageAnalyser& pa){;}
};

#endif 