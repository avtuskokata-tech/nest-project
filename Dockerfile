# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только файлы необходимые для установки зависимостей
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Устанавливаем ВСЕ зависимости для сборки
RUN npm ci --include=dev

# Генерируем Prisma клиент
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Этап продакшн
FROM node:18-alpine AS production

WORKDIR /app

# Устанавливаем зависимости для работы с Prisma
RUN apk add --no-cache openssl

# Копируем package.json для production зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем ТОЛЬКО production зависимости
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Копируем скомпилированное приложение из builder stage
COPY --from=builder /app/dist ./dist

# Копируем Prisma схему и клиент
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Меняем владельца файлов
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

CMD ["node", "dist/main.js"]