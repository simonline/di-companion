FROM node:18-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
RUN ["npm", "run", "build"]
EXPOSE 1337
CMD ["npm", "run", "start"]
