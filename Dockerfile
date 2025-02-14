# stage 1: Build
FROM node:18.20-alpine AS builder
WORKDIR /app

# copy package.json & package-lock.json lalu install dependencies
COPY package*.json ./
RUN npm ci

# copy seluruh kode aplikasi
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18.20-alpine
WORKDIR /app

# copy hasil build dari stage pertama
COPY --from=builder /app ./

# expose port aplikasi
EXPOSE 3000

# jalankan aplikasi Next.js
CMD ["npm", "run", "start"]
