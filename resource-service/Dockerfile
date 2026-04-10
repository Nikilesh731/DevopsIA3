FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY resource-service/package*.json ./resource-service/
RUN cd resource-service && npm install

COPY resource-service ./resource-service
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /app/resource-service

ENV NODE_ENV=production
ENV PORT=5003

EXPOSE 5003

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]