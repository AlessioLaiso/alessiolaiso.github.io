FROM node:18-alpine

WORKDIR /app

RUN apk add github-cli bash fish curl
RUN npm i -g npm
RUN git config --global user.email "deploy@alessiolaiso.com"
RUN git config --global user.name "Deployment (alessiolaiso.com)"

EXPOSE 8080
EXPOSE 35729

CMD ["fish"]