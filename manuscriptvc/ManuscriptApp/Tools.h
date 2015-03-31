#ifndef  _TOOLS_H_ 
#define _TOOLS_H_

template <class T> 
T Max(T a, T b, T c){
	if ( a > b ) 
		return ( a > c ) ? a : c ;
	else	
		return ( b > c ) ? b : c ;
}

template <class T> 
T Min(T a, T b, T c){
	if ( a < b ) 
		return ( a < c ) ? a : c ;
	else	
		return ( b < c ) ? b : c ;
}

template <class T> 
T MaxIndex(T a, T b, T c){
	if ( a >= b ) 
		return ( a >= c ) ? 0 : 2 ;
	else	
		return ( b > c ) ? 1 : 2 ;
}

template <class T> 
int MinIndex(T a, T b, T c){
	if ( a < b ) 
		return ( a < c ) ? 0 : 2 ;
	else	
		return ( b < c ) ? 1 : 2 ;
}


template <class T>
T MinArray(T* v,int size){
	T min = v[0];
	for (int i = 1; i < size; i++){
		if (v[i] < min){
			min = v[i];
		}
	}
	return min;
}

template <class T>
T MaxArray(T* v,int size){
	T max = v[0];
	for (int i = 1; i <	size; i++){
		if (v[i] > max){
			max = v[i];
		}
	}
	return max;
}

#endif 