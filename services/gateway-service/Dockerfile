FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY services/gateway-service/package*.json ./services/gateway-service/
RUN cd services/gateway-service && npm install

COPY services/gateway-service ./services/gateway-service
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /app/services/gateway-service

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]