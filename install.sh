#!/bin/bash

sudo apt update

sudo apt install ffmpeg

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

source ~/.bashrc

sudo nvm install v12.16.3
