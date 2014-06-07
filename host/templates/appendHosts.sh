#!/bin/bash
domain=<%= name %>
now=$(date +"%Y-%m-%d")
hostline="127.0.0.1"$'\t'"$domain"$'\t'"#Created by <yo symbio> on $now"
filename=/etc/hosts
  # If the line wasn't found, add it using an echo append >>

echo "$hostline" >> "$filename"
