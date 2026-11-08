# Test runner image: Playwright's official image already contains Node, Chromium/Firefox/WebKit
# and all OS libraries, so nothing has to be downloaded at test time.
# Keep the tag in sync with @playwright/test in package.json.
FROM mcr.microsoft.com/playwright:v1.65.0-noble

WORKDIR /app

# Install dependencies first so this layer is cached until package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Reports land in /app/playwright-report, /app/allure-results, /app/test-results
# (mounted as volumes by docker-compose.yml).
CMD ["npx", "playwright", "test"]
