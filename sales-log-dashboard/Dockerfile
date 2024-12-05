# Step 1: Build the Angular application
FROM node:18s AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire Angular application code
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Step 2: Set up Nginx to serve the app
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built Angular application from the previous build stage
COPY --from=build /app/dist/sales-log-dashboard /usr/share/nginx/html

# Expose port 80 for serving the app
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
