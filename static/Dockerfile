ARG TAG=20-alpine
FROM node:$TAG

RUN npm install -g npm@^10

WORKDIR /app/static/

CMD ["run build"]

ENTRYPOINT ["npm"]
