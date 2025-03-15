FROM node:18

WORKDIR /api

COPY . .

RUN rm -rf node_modules
RUN npm i

CMD ["npm", "run", "dev"]

EXPOSE 5002