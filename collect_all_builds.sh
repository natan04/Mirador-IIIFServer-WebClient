MODE=$1
if [ -z $1 ]
	then
		MODE=DEV
fi

echo "DEPLOYMENT MODE = $MODE"
echo "--------------------------"

echo "Making ALL_BUILDS base directory tree"
mkdir -p ALL_BUILDS/Mirador
mkdir -p ALL_BUILDS/PictureHandler
mkdir -p ALL_BUILDS/digilib

echo "********** ##### Mirador - copying all build files"
cp -r Mirador/build/* ALL_BUILDS/Mirador/build
cp Mirador/index.html ALL_BUILDS/Mirador
cp Mirador/mirador-config.json* ALL_BUILDS/Mirador

echo "********** ##### Mirador - sets config files to $MODE mode"
echo "********** ##### Mirador - DONE."

echo "********** ##### PictureHandler - copying all build files"
cp -r digilib/digilib/webapp/target/digilib-webapp-2.3-SNAPSHOT/* ALL_BUILDS/digilib
echo "********** ##### PictureHandler - sets config files to $MODE mode"
echo "********** ##### PictureHandler - DONE."


echo "********** ##### digilib - copying all build files"

cp -r PictureHandlerProject/PictureHandler/target/PictureHandler-1.0-SNAPSHOT/* ALL_BUILDS/PictureHandler
echo "********** ##### digilib - sets config files to $MODE mode"
echo "********** ##### digilib - DONE."


