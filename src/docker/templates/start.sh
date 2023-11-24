#!/bin/bash

t_start_time=$(date +"%T.%3N")
t_start_time_unix=$(date -d "$t_start_time" +"%s%3N" 2>/dev/null)
"$@" &
t2_start_time=$(date +"%T.%3N")
t2_start_time_unix=$(date -d "$t2_start_time" +"%s%3N" 2>/dev/null)

wait "$pid"

end_time=$(date +"%T.%3N")
end_time_unix=$(date -d "$end_time" +"%s%3N" 2>/dev/null)

file="time.txt"
result=$((end_time_unix - (t_start_time_unix + t2_start_time_unix) / 2))

echo "Before Start Time (Unix): $t_start_time_unix" >> "$file"
echo "After Start Time (Unix): $t2_start_time_unix" >> "$file"
echo "End Time (Unix): $end_time_unix" >> "$file"
echo "Result: $result" >> "$file"
