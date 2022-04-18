FROM node:14
RUN mkdir /app
ADD . /app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000 5000 8000
CMD ["node", "server"]