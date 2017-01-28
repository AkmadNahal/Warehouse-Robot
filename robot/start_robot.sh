#!/bin/bash

clear

# Get file directory
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get device local IP address
ip=$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')

# Write IP to a file
echo $ip > $dir/robot_local_ip.txt

# Start the robot control task
python $dir/robot_control.py

# Remove the IP file
rm $dir/robot_local_ip.txt