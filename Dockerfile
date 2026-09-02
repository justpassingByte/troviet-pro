# Multi-stage Build for Production
FROM node:20-alpine AS builder-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:20-alpine AS builder-backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/app/data

COPY backend/package*.json ./
RUN npm install --only=production

COPY --from=builder-backend /app/backend/dist ./dist
COPY --from=builder-frontend /app/frontend/dist /app/frontend/dist

EXPOSE 4000
VOLUME ["/app/data"]

CMD ["node", "dist/index.js"]
