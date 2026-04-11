FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY resource-service/package*.json ./resource-service/
RUN cd resource-service && npm install

COPY resource-service ./resource-service

WORKDIR /app/resource-service

ENV NODE_ENV=production
ENV PORT=5003
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=epidemic_user
ENV DB_PASSWORD=epidemic_password
ENV DB_NAME=epidemic_simulation

EXPOSE 5003

CMD ["npm", "start"]