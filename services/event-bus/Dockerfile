FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
COPY services/event-bus/package*.json ./services/event-bus/

RUN cd services/event-bus && npm ci --omit=dev

COPY services/event-bus ./services/event-bus

WORKDIR /app/services/event-bus

ENV NODE_ENV=production
ENV PORT=5005

EXPOSE 5005

CMD ["npm", "start"]