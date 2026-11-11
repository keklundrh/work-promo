# Build stage: compile the SPA with Vite inside a container
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS build
WORKDIR /app
COPY --chown=1001:0 package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY --chown=1001:0 . .
RUN npm run build

# Runtime stage: static serve, non-root, OpenShift-friendly (arbitrary UID)
FROM registry.access.redhat.com/ubi9/nginx-124:latest
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /opt/app-root/etc/nginx.conf
EXPOSE 8080
CMD ["nginx", "-c", "/opt/app-root/etc/nginx.conf", "-g", "daemon off;"]
