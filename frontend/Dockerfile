FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve MUI conflicts
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Expose port 5173 (Vite dev server)
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
