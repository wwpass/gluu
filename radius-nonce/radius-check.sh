#!/bin/bash

if [[ $# < 3 ]] ; then
        echo 'You must provide user name, Tunnel group name, RADIUS nonce'
        exit 1
fi

username=$1
profile=$2
nonce=$3
RETVAL=

curl --silent -X POST --data-urlencode username=$username --data-urlencode profile=$profile --data-urlencode nonce=$nonce --fail http://localhost:9061/api/v1/check
RETVAL=$?
if [ $RETVAL != 0 ] ; then
	RETVAL=1
fi
echo RETVAL $RETVAL
exit $RETVAL
