FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY simulation-service/package*.json ./simulation-service/
RUN cd simulation-service && npm install

COPY simulation-service ./simulation-service

WORKDIR /app/simulation-service

ENV NODE_ENV=production
ENV PORT=5002
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=epidemic_user
ENV DB_PASSWORD=epidemic_password
ENV DB_NAME=epidemic_simulation

EXPOSE 5002

CMD ["npm", "start"]