FROM composer:2 AS dependencies

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --ignore-platform-req=ext-pdo_pgsql --no-scripts

COPY .env.example .env
COPY . .
RUN composer dump-autoload --no-interaction --no-scripts

FROM php:8.3-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=dependencies /app /app

EXPOSE 8000

CMD ["sh", "-lc", "if [ ! -f config/jwt/private.pem ]; then if [ \"$APP_ENV\" = dev ]; then php bin/console lexik:jwt:generate-keypair; else echo 'JWT keys are required outside development.' >&2; exit 1; fi; fi && php bin/console doctrine:migrations:migrate --no-interaction && php -d opcache.enable_cli=1 -d opcache.validate_timestamps=1 -d opcache.revalidate_freq=1 -S 0.0.0.0:8000 -t public public/index.php"]
