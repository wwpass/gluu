#!/bin/bash

if [[ $# < 4 ]] ; then
        echo 'You must provide user name, Tunnel group name, RADIUS nonce'
        exit 1
fi

username=$1
profile=$2
nonce=$3
port=$4
RETVAL=

curl --silent -X POST --data-urlencode username=$username --data-urlencode profile=$profile --data-urlencode nonce=$nonce --fail http://localhost:$port/api/v1/check
RETVAL=$?
if [ $RETVAL != 0 ] ; then
	RETVAL=1
fi
echo RETVAL $RETVAL
exit $RETVAL
