FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY region-service/package*.json ./region-service/
RUN cd region-service && npm install

COPY region-service ./region-service

WORKDIR /app/region-service

ENV NODE_ENV=production
ENV PORT=5001
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=epidemic_user
ENV DB_PASSWORD=epidemic_password
ENV DB_NAME=epidemic_simulation

EXPOSE 5001

CMD ["npm", "start"]