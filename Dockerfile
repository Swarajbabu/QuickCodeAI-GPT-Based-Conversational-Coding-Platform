# ==========================================
# Stage 1: Build Frontend Assets
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Server
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install Backend production dependencies
COPY Backend/package*.json ./Backend/
RUN npm install --prefix Backend --omit=dev

# Copy Backend source code
COPY Backend/ ./Backend/

# Copy built static assets from Stage 1
COPY --from=frontend-builder /app/Frontend/dist ./Frontend/dist

# Expose server port
EXPOSE 8080

# Start server
CMD ["node", "Backend/server.js"]
