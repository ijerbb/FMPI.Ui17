# FROM node:lts-alpine AS node
# ENV NODE_ENV=production
# WORKDIR /app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN NODE_ENV=production npm i
# # RUN npm install --production --silent && mv node_modules ./
# RUN npm install -g @angular-devkit/build-angular:browser
# RUN npm install -g @angular/cli && npm install -g @angular-devkit/build-angular
# COPY . /app
# RUN npm run build --omit=dev
# EXPOSE 4200
# RUN chown -R node /app
# USER node
# CMD ["npm", "start"]

# Stage 1
FROM node:lts-alpine as build

ARG ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT}

WORKDIR /app
COPY . ./
COPY package*.json ./

RUN npm install -g @angular/cli && \
    npm install --legacy-peer-deps && \
    npm run build-prod

# Stage 2
FROM nginx:latest
WORKDIR /app
COPY --from=build /app/dist/FMPI.Ui/browser /usr/share/nginx/html
EXPOSE 4200
COPY /nginx.conf  /etc/nginx/conf.d/default.conf

# Copy environment-specific certificates
# Production (Docker): fmpicert.crt/fmpicert.key
# Development (local Docker): dotnet-devcert.crt/dotnet-devcert.key
COPY /fmpicert.crt /usr/share/nginx/html/
COPY /fmpicert.key /usr/share/nginx/html/

