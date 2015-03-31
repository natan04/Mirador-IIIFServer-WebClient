#include "stdafx.h"
#include "DImage.h"
#include "BinaryComponentTree.h"
using namespace cv;

BinaryComponentTree::BinaryComponentTree(){ ; }

void BinaryComponentTree::insert(BinaryComponentNode *node){
	if (!_root) {
		_root = node;
	}
	else{
		recursiveInsert(_root, node);
		}
}

void BinaryComponentTree::recursiveInsert(BinaryComponentNode* current_node, BinaryComponentNode * node_to_add){

	ConnectedComponent* current_node_component = current_node->getComponent();
	ConnectedComponent* node_to_add_component = node_to_add->getComponent();

	Rect c = current_node_component->getBoundRect();
	Rect t = node_to_add_component->getBoundRect();

	Point t_center(t.x + (t.width / 2), t.y + (t.height / 2));

	bool down_t = false;

	// if component_to_add is contained within the current shape - recursively check all children of current_node.
	vector<BinaryComponentNode*> children = current_node->getChildren();
	if (c.contains(t_center)){
		if (children.size() > 0){
			for (int i = 0; i < children.size(); i++){
				Rect ch = (children[i]->getComponent())->getBoundRect();
				if (ch.contains(t_center)){
					down_t = true;
					recursiveInsert(children[i], node_to_add);
				}
			}
			// case node_to_add is contained within current_node but not within any of his children.
			if (down_t == false) { 
				node_to_add->setParent(current_node);
				(current_node->getChildren()).push_back(node_to_add);
			}
		}
		// case current_node is a leaf.
		else {
			node_to_add->setParent(current_node);
			(current_node->getChildren()).push_back(node_to_add);
		}	
	}
}

BinaryComponentNode* BinaryComponentTree::getRoot(){
	return _root;
}

