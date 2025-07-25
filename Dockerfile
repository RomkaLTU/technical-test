# Public Docker images repo has a pull limit
ARG REGISTRY_BASE=node
# Build Stage 1
# This build created a staging docker image
#
FROM ${REGISTRY_BASE}:16-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Prune packages and reuse them in next stage
RUN npm prune --production

# Build Stage 2
# This build takes the production build from staging build
#
FROM ${REGISTRY_BASE}:16-alpine
ARG APP_VERSION
WORKDIR /home/site/wwwroot
COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
ENV APP_VERSION=${APP_VERSION}

# Start the application
CMD ["node", "dist/main.js"]

