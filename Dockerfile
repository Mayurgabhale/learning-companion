# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# Note: VITE_ environment variables must be present during build
# You can pass them as --build-arg if needed, but for now we assume they are in the environment or .env
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config template
COPY nginx.conf /etc/nginx/conf.d/configfile.template

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Default port for Cloud Run is 8080
ENV PORT 8080
EXPOSE 8080

# Use envsubst to replace the ${PORT} variable in nginx config and start nginx
CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
