FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm install --workspaces --include-workspace-root

# Copy source
COPY . .

# Build shared types
RUN npm run build --workspace=shared

# Build backend
RUN npm run build --workspace=backend

# Build frontend
RUN npm run build --workspace=frontend

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/shared/package.json ./shared/
COPY --from=base /app/shared/dist ./shared/dist
COPY --from=base /app/backend/package.json ./backend/
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/backend/src/db/schema.sql ./backend/dist/db/schema.sql
COPY --from=base /app/frontend/dist ./frontend/dist
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
