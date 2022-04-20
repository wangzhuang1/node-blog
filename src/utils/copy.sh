#!/bin/zsh

cd /Users/wangzhuang/wz/code/node/blog-1/logs
cp access.log $(date +%Y-%m-%d-%H).access.log
echo "" > access.log
