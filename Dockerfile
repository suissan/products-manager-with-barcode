FROM ghcr.io/puppeteer/puppeteer:22.13.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /user/src/app

COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
CMD ["node", "./bin/www"]