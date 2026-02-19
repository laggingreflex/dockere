FROM ghcr.io/openai/codex-universal:latest

ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

# USER root
RUN apt-get update
RUN apt-get install -y nodejs npm
RUN npm install -g @openai/codex

EXPOSE 1455

WORKDIR <workdir>

ENTRYPOINT ["/bin/bash", "-c"]
CMD bash -li
