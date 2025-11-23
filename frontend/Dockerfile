# frontend/Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# create-react-app uygulamanızda artık muhtemelen kullanılmıyor, kaldırabiliriz.
# RUN npm install -g create-react-app

# Copy package files (Context artık frontend klasörü olduğu için direkt kopyalayabiliriz)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Frontend'i çalıştırdığınız port 3000, bunu dışarıya açıyoruz.
EXPOSE 3000 

# CMD'yi 3000'e ayarlayın (Sizin komutunuzda '300' yazıyordu, '3000' olarak düzeltildiğini varsayıyorum)
CMD ["serve", "-s", "build", "-l", "3000"]