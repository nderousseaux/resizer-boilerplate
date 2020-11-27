FROM node:14
LABEL author="Nathanaël Derousseaux <nathanael.derousseaux@outlook.fr>"

ENV NODE_ENV=production

COPY ./ /app
WORKDIR /app

RUN npm install

#Metadonnées
EXPOSE 1337
CMD npm run start