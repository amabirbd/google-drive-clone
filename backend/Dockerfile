# syntax=docker/dockerfile:1

# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
