#!/bin/bash

file="time.txt"

first_start_time=$(date +"%s%3N" 2>/dev/null)

"$@" &

second_start_time=$(date +"%s%3N" 2>/dev/null)

pid=$!
wait "$pid"

start_time=$((($first_start_time + $second_start_time) / 2))
end_time=$(date +"%s%3N" 2>/dev/null)

echo "Start: $start_time" >> "$file"
echo "End: $end_time" >> "$file"