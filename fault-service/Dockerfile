FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY fault-service/package*.json ./fault-service/
RUN cd fault-service && npm install

COPY fault-service ./fault-service

WORKDIR /app/fault-service

ENV NODE_ENV=production
ENV PORT=5004
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=epidemic_user
ENV DB_PASSWORD=epidemic_password
ENV DB_NAME=epidemic_simulation

EXPOSE 5004

CMD ["npm", "start"]