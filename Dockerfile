# Etapa 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Produção
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
