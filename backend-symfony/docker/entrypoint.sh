#!/bin/sh
set -eu

if [ -n "${JWT_SECRET_KEY_CONTENT:-}" ] && [ -n "${JWT_PUBLIC_KEY_CONTENT:-}" ]; then
    printf '%s\n' "$JWT_SECRET_KEY_CONTENT" > config/jwt/private.pem
    printf '%s\n' "$JWT_PUBLIC_KEY_CONTENT" > config/jwt/public.pem
    chmod 600 config/jwt/private.pem
elif [ "${APP_ENV:-prod}" = "dev" ]; then
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
else
    echo "JWT_SECRET_KEY_CONTENT and JWT_PUBLIC_KEY_CONTENT are required outside development." >&2
    exit 1
fi

php bin/console doctrine:migrations:migrate --no-interaction
if [ "${SEED_DEMO_CATALOG:-false}" = "true" ]; then
    php bin/console app:demo:seed --no-interaction
fi
chown -R www-data:www-data var

exec docker-php-entrypoint "$@"
