# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve MUI conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 5173 (Vite dev server)
EXPOSE 5173

# Command to start the development server with hot reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
