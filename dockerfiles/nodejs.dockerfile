FROM node

# RUN apt-get update
# RUN apt-get install -y git
# RUN apt-get install -y vim

WORKDIR <root-dir>

# ENV NODE_ENV=development

# This creates a volume that contains a copy of node_modules from the image, and mounts it in the container (http://jdlm.info/articles/2016/03/06/lessons-building-node-app-docker.html#the-nodemodules-volume-trick)
VOLUME <root-dir>/node_modules

# This installs node_modules in the *image*
ADD package.json .
RUN npm install

# # Enable polling for any watcher tools that use CHOKIDAR.
# ENV CHOKIDAR_USEPOLLING=true

CMD npm start
