#!/bin/bash

MIRADOR_DIR="/var/lib/tomcat7/webapps/Mirador"
FILES_TO_COPY="build index.html mirador-config.json"
USER=royk

########################## Clean ##########################
if [ "$1" = "clean" ]
then
	echo "Cleaning...."
	rm -R $MIRADOR_DIR
	exit
fi
########################## Clean ##########################



if [ "$1" = "guard" ]
then
	echo "Guard mode: stopping server"
	service tomcat7 stop
fi

########################## Copy ##########################
if [ -d "$MIRADOR_DIR" ]
then
	echo "Directory $MIRADOR_DIR already exists!"
else
	echo "- - - creating directory $MIRADOR_DIR & sets permissions"
	mkdir $MIRADOR_DIR
fi

for file in $FILES_TO_COPY
do
	if [ ! -e "$file" ]
	then
		echo "$file doesn't exist."; echo
		continue
	fi

	echo "- - - copying $file"
	cp -R $file $MIRADOR_DIR/
done

echo "Sets permissions"
chown -R $USER:tomcat7 $MIRADOR_DIR/
########################## Copy ##########################


if [ "$1" = "guard" ]
then
	echo "Guard mode: starting server"
	service tomcat7 start
fi
