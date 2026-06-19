FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Next.js default port
EXPOSE 3000

# Run in dev mode for local development verification
CMD ["npm", "run", "dev"]
