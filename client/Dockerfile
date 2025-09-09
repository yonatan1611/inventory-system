# client/Dockerfile - build React app then serve with nginx (and proxy /api to server)
################################################################################
# Stage 1: build the React app
FROM node:20-alpine AS build
WORKDIR /app

# copy package files for caching
COPY client/package*.json ./

# install dependencies
RUN npm install

# copy source & build
COPY client/ ./
RUN npm run build

################################################################################
# Stage 2: nginx to serve built files
FROM nginx:stable-alpine
# copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# copy nginx config
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
