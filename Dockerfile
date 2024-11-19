FROM node:20-bullseye-slim as as stage-build
ARG TARGETARCH

ARG DEPENDENCIES="                    \
        build-essential               \
        ca-certificates               \
        icnsutils                     \
        git                           \
        git-lfs                       \
        graphicsmagick                \
        wine                          \
        wine32                        \
        xz-utils"

ARG APT_MIRROR=http://mirrors.ustc.edu.cn
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    sed -i "s@http://.*.debian.org@${APT_MIRROR}@g" /etc/apt/sources.list \
    && rm -f /etc/apt/apt.conf.d/docker-clean \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends ${DEPENDENCIES} \
    && echo "no" | dpkg-reconfigure dash

ARG NPM_REGISTRY="https://registry.npmmirror.com"
RUN set -ex \
    && npm config set registry ${NPM_REGISTRY} \
    && yarn config set registry ${NPM_REGISTRY}

WORKDIR /data

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    --mount=type=bind,sources=package.json,target=/data/package.json \
    yarn install

ADD . /data
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    yarn build

WORKDIR /data/build