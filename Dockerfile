### Stage 1 ###
FROM node:16.12-alpine AS ts-compiler
WORKDIR /app
COPY package.json yarn.lock ./
COPY tsconfig*.json ./
RUN yarn install --pure-lockfile
COPY . ./
RUN yarn build

### Stage 2 ###
FROM node:16.12-alpine AS ts-remover
WORKDIR /app
COPY --from=ts-compiler /app/package.json /app/yarn.lock ./
COPY --from=ts-compiler /app/dist ./dist
COPY --from=ts-compiler /app/views ./views
COPY --from=ts-compiler /app/public ./public
RUN mkdir -p logs
RUN yarn install --production

### Stage 3 ###
FROM gcr.io/distroless/nodejs:16
WORKDIR /app
EXPOSE 5000
COPY --from=ts-remover /app ./
USER 1000
CMD ["dist/app.js"]
