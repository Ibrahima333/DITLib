FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_LIVRES_API_URL=http://localhost:8011
ARG VITE_UTILISATEURS_API_URL=http://localhost:8002
ARG VITE_EMPRUNTS_API_URL=http://localhost:8003
ENV VITE_LIVRES_API_URL=$VITE_LIVRES_API_URL
ENV VITE_UTILISATEURS_API_URL=$VITE_UTILISATEURS_API_URL
ENV VITE_EMPRUNTS_API_URL=$VITE_EMPRUNTS_API_URL

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
