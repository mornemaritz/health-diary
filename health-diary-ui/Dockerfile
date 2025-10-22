FROM node:22-alpine

# Create a custom app user and group to avoid running as root
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g serve

COPY --chown=appuser:appgroup . .

RUN npm run build

EXPOSE 3000

USER appuser

CMD [ "serve", "-s", "dist" ]