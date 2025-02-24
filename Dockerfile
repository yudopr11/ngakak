# Build stage
FROM node:18-alpine as build-env

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=build-env /app/dist /app/dist
COPY package*.json ./
RUN npm ci --production

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "preview"]