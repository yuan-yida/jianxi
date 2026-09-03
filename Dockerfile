# 多阶段构建：先编译前端 + 打包后端，再生成精简运行镜像
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

# 先复制依赖清单，利用缓存加速
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prefer-offline

# 复制源码并构建
COPY . .
RUN pnpm build

# 运行阶段：仅保留构建产物与生产依赖
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV COZE_PROJECT_ENV=PROD
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/server ./server

EXPOSE 3000
CMD ["node", "dist-server/index.js"]
