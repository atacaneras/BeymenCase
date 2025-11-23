# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
RUN npm install -g create-react-app

# Copy package files
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

EXPOSE 3001

CMD ["serve", "-s", "build", "-l", "3000"]