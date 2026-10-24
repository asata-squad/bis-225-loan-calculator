FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# APP_KEY генерируется при первом старте, если пусто
RUN chown -R www-data:www-data storage bootstrap/cache || true

EXPOSE 4000
CMD php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=4000
