FROM denoland/deno:2.1.4

WORKDIR /root/
EXPOSE 8000

COPY ./web/dist/ /root/web/dist/
COPY ./server/deno.json /root/deno.json
COPY ./server/deno.lock /root/deno.lock
COPY ./server/src/ /root/src/
COPY ./.env /root/.env

VOLUME /data

RUN deno install

CMD ["deno", "run", "--allow-read", "--allow-write", "--allow-net", "--allow-env", "src/main.ts"]
