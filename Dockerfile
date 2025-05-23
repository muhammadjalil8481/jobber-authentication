# Stage 1 - Build the application

FROM node:22.15.0-alpine AS builder

WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
COPY .npmrc .
COPY src ./src

RUN npm install
RUN npm ci
RUN npm run build

# Stage 2 - Production image
FROM node:22.15.0-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json .
COPY tsconfig.json .
COPY .npmrc .

RUN npm ci --production

COPY --from=builder /app/dist ./dist

EXPOSE 4002

CMD ["npm", "run", "start"]
