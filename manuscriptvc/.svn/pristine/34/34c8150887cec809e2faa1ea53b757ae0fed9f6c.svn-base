#include "stdafx.h"
#include "EMClassifier.h"
#include "GaborBlobFeature.h"

EMClassifier::EMClassifier(void){
}


EMClassifier::~EMClassifier(void){

}

int EMClassifier::predict(Feature* feature, float& probability){
	Vec2d prediction = _model.predict(feature->vectorize());
	probability = prediction[0] ;
	return prediction[1] ;
}


void EMClassifier::train(vector<Feature*> feature_vector) {
	Mat samples(feature_vector.size(), 8 , CV_32FC1);
	Mat labels(feature_vector.size(), 1, CV_32SC1 );
	Mat likelihoods(feature_vector.size(), 1, CV_64FC1);
	for ( int i = 0; i < feature_vector.size(); i++ )
		feature_vector[i]->sample2Row(samples, i);

	_probability.create(feature_vector.size(), 2, CV_64FC1);
	_model.train(samples, likelihoods, labels, _probability);
}

