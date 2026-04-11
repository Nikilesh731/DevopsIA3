FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY services/gateway-service/package*.json ./services/gateway-service/
RUN cd services/gateway-service && npm install

COPY services/gateway-service ./services/gateway-service

WORKDIR /app/services/gateway-service

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=epidemic_user
ENV DB_PASSWORD=epidemic_password
ENV DB_NAME=epidemic_simulation

EXPOSE 5000

CMD ["npm", "start"]