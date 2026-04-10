FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
RUN cd shared && npm install

COPY services/event-bus/package*.json ./services/event-bus/
RUN cd services/event-bus && npm install

COPY services/event-bus ./services/event-bus
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

WORKDIR /app/services/event-bus

ENV NODE_ENV=production
ENV PORT=5005

EXPOSE 5005

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]