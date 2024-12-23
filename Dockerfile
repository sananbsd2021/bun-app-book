FROM oven/bun

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY ./src ./src
# COPY ./.env ./.env
COPY ./mydb.sqlite ./mydb.sqlite

EXPOSE 8000

CMD [ "bun", "src/index.ts" ]