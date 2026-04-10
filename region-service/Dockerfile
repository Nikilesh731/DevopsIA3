FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY region-service/package*.json ./region-service/
RUN cd region-service && npm install

COPY region-service ./region-service
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /app/region-service

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]