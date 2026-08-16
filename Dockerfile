# PlainSlang — full server edition
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PLAINSLANG_DB_PATH=/data/plainslang.db
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/app ./app
COPY --from=build /app/lib ./lib
COPY --from=build /app/components ./components
COPY --from=build /app/next.config.mjs /app/jsconfig.json ./
VOLUME /data
EXPOSE 3000
CMD ["npm", "start"]
