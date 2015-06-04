# Tools List XML Format:
* FunctionList
    * Function
        * Class
            * Parameter
            * Parameter
            * Parameter
        * Class
        * Class
    * Function
        * Class
    * Flow
        * Path


## FunctionList - General container for functions/flows

## Function
> Defines classes of functions

- Attributes:
    - **Name**
    - **Input** - default: "Image"
    - **Output** - Image/Float
    
## Class                       
> Defines specific function class    
                                  
- Attributes:                     
    - **Name**
    - **Description**

## Parameter                       
> Defines parameter for function class   
                                  
- Attributes:                     
    - **Name**                    
    - **Type** - int/bool/float
    - **Description**
       
## Flow
> Same as **function**
