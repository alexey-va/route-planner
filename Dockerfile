FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g serve
COPY . .
RUN npm run build
COPY ./data.geojson ./dist/data.geojson

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /usr/local/lib/node_modules/serve /usr/local/lib/node_modules/serve
COPY --from=builder /usr/local/bin/serve /usr/local/bin/serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
