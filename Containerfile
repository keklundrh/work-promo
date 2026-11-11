# Build stage: compile SPA + server with Vite/tsc inside a container
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS build
WORKDIR /app
COPY --chown=1001:0 package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY --chown=1001:0 . .
RUN npm run build

# Runtime stage: Node serves the API and the built SPA in one container.
# Identity comes from the OpenShift OAuth proxy header (USER_HEADER).
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest
WORKDIR /opt/app-root/app
ENV NODE_ENV=production PORT=8080
COPY --chown=1001:0 --from=build /app/dist /opt/app-root/app/public
COPY --chown=1001:0 --from=build /app/node_modules /opt/app-root/app/node_modules
COPY --chown=1001:0 --from=build /app/server /opt/app-root/app/server
COPY --chown=1001:0 --from=build /app/package.json ./
EXPOSE 8080
CMD ["node", "--experimental-strip-types", "server/index.ts"]
