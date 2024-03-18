FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 3000
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
