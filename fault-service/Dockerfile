FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY fault-service/package*.json ./fault-service/
RUN cd fault-service && npm install

COPY fault-service ./fault-service
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /app/fault-service

ENV NODE_ENV=production
ENV PORT=5004

EXPOSE 5004

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]