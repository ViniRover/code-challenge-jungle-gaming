FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci
FROM dependencies AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev:mocks"]
FROM dependencies AS build
COPY . .
ARG VITE_MOCKS=true
ENV VITE_MOCKS=$VITE_MOCKS
RUN npm run build
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts/serve.mjs ./scripts/serve.mjs
USER node
EXPOSE 4173
ENV PORT=4173
CMD ["node", "scripts/serve.mjs"]
