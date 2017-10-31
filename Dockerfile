FROM node:boron
WORKDIR /server
# Install app dependencies
COPY package.json .
RUN npm install
COPY . .
EXPOSE 2424
CMD [ "npm", "start" ]