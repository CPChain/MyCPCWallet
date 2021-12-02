FROM node:14.18.1-stretch AS builder

ENV HOME /home
ENV NODE_OPTIONS --max-old-space-size=8192
RUN npm install npm@6.14 -g
RUN node -v && npm -v
WORKDIR /home
