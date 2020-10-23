#!/bin/bash

if [[ $# < 5 ]] ; then
        echo 'You must provide user name, Tunnel group name, RADIUS nonce'
        exit 1
fi

username=$1
profile=$2
nasid=$3
nonce=$4
port=$5

if [[ x$profile == x ]]; then
	profile=$nasid
fi
RETVAL=

curl --silent -X POST --data-urlencode username=$username --data-urlencode profile=$profile --data-urlencode nonce=$nonce --fail http://localhost:$port/api/v1/check
RETVAL=$?
if [ $RETVAL != 0 ] ; then
	RETVAL=1
fi
echo RETVAL $RETVAL
exit $RETVAL
