# Use Nginx to serve pre-built Angular app
FROM nginx:stable-alpine

# (Optional) Use a custom Nginx config
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy pre-built Angular app to Nginx's default directory
COPY dist/sales-log-dashboard /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

