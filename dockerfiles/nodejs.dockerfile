FROM node

# RUN npm -g i -s --depth=0 yarn

WORKDIR <root-dir>

VOLUME <root-dir>/node_modules

CMD bash -li
