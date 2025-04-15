FROM node:18-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git libc6-compat
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
# Add npm configuration to prevent hanging and improve reliability
RUN npm config set fetch-retry-maxtimeout 600000 -g && \
    npm config set fetch-retry-mintimeout 10000 -g && \
    npm config set fetch-retries 5 -g && \
    npm config set fetch-timeout 300000 -g && \
    npm config set progress false -g && \
    npm config set loglevel warn -g
RUN npm install
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN chown -R node:node /opt/app
USER node
# Upgrade Strapi to the latest minor version
RUN npx @strapi/upgrade minor
RUN ["npm", "run", "build"]
EXPOSE 1337
CMD ["npm", "run", "start"]
