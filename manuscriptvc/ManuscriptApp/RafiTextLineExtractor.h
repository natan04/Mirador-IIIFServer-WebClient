#include "TextLineExtractor.h"
#include "BinaryComponentTree.h"
class RafiTextLineExtractor :public TextLineExtractor{
	Mat filterDocument();
	int findRootThreshold();
	BinaryComponentTree buildComponentTree();
	void recursiveTraversal(BinaryComponentNode* current_node, vector<ConnectedComponent*>& result, double wordSizeEst);
	vector<ConnectedComponent*> TraverseTree();
	double computeOrientation(vector<Point> &pts, Mat &img);
public:
	RafiTextLineExtractor();
	void extract();
};

