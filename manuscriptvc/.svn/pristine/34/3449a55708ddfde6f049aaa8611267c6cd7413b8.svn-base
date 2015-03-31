#ifndef _BINARY_COMPONENT_TREE_
#define _BINARY_COMPONENT_NODE_H_
#include "ConnectedComponent.h"

class BinaryComponentNode
{
	BinaryComponentNode* _parent;
	ConnectedComponent* _connected_component;
	vector<BinaryComponentNode*> _children;

public:
	BinaryComponentNode(ConnectedComponent* _comp);
	vector<BinaryComponentNode*>& getChildren();
	ConnectedComponent* getComponent() { return _connected_component; }
	BinaryComponentNode* getParent() { return _parent; }
	void setParent(BinaryComponentNode* node) { _parent=node; }

	~BinaryComponentNode();
};

#endif
