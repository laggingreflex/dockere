FROM node

# RUN apt-get update
# RUN apt-get install -y git
# RUN apt-get install -y vim

# RUN npm -g i -s --depth=0 yarn

WORKDIR <root-dir>

# # This installs node_modules in the *image*
# ADD package.json .
# RUN yarn

# # This creates a volume that contains a copy of node_modules from the image, and mounts it in the container (http://jdlm.info/articles/2016/03/06/lessons-building-node-app-docker.html#the-nodemodules-volume-trick)
# VOLUME <root-dir>/node_modules

CMD bash -li
