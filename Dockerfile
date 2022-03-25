FROM node:14-alpine AS ui-build 

WORKDIR /usr/app/

# Install node dependencies - done in a separate step so Docker can cache it.
COPY package*.json ./

# # --no-cache: download package index on-the-fly, no need to cleanup afterwards
# # --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --update --no-cache --virtual build-dependencies add \
    python3 \
    && npm install \
    && apk del build-dependencies

# Copy project files into the docker image
COPY . .

RUN npm run build

FROM node:14-alpine AS server-build 

ARG DB_HOST
ARG DB_USER
ARG DB_PASS
ARG DB_SCHEMA

ENV DB_HOST=$DB_HOST
ENV DB_USER=$DB_USER
ENV DB_PASS=$DB_PASS
ENV DB_SCHEMA=$DB_SCHEMA

WORKDIR /usr/app/

COPY --from=ui-build /usr/app/build/ ./build 

# Install node dependencies - done in a separate step so Docker can cache it.
COPY package*.json ./

# # --no-cache: download package index on-the-fly, no need to cleanup afterwards
# # --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --update --no-cache --virtual build-dependencies add \
    python3 \
    && npm install \
    && apk del build-dependencies

COPY server.js ./
COPY swagger.json ./
ADD db ./db

EXPOSE 8080 

CMD [ "node", "server.js" ]
