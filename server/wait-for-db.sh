#!/bin/sh
# usage: wait-for-db.sh host port timeout_seconds
set -e
host="$1"; port="$2"; timeout=${3:-30}
i=0
while ! nc -z "$host" "$port"; do
  i=$((i+1))
  if [ "$i" -ge "$timeout" ]; then
    echo "Timeout waiting for $host:$port"
    exit 1
  fi
  sleep 1
done
echo "$host:$port is available"
