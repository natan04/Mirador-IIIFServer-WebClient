#ifndef _BINARY_COMPONENT_TREE_
#define _BINARY_COMPONENT_TREE_H_
#include "ConnectedComponent.h"
#include "BinaryComponentNode.h"
class BinaryComponentTree
{
	BinaryComponentNode * _root;
	void recursiveInsert(BinaryComponentNode * current_node, BinaryComponentNode * node_to_add);
public:
	BinaryComponentTree();
	void insert(BinaryComponentNode * node);
	BinaryComponentNode* getRoot();
};

#endif