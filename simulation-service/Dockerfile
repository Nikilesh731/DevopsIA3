FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY simulation-service/package*.json ./simulation-service/
RUN cd simulation-service && npm install

COPY simulation-service ./simulation-service
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /app/simulation-service

ENV NODE_ENV=production
ENV PORT=5002

EXPOSE 5002

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]