// ABOUTME: Vite integration for Express server
// ABOUTME: Handles dev middleware and production static file serving

import type { Application, Request, Response } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';

/**
 * 集成 Vite 开发服务器（中间件模式）
 * 所有 vite 相关 import 都在函数内部动态加载，
 * 确保 tsup 打包生产 bundle 时不会包含 vite/vue 插件代码
 */
export async function setupViteMiddleware(app: Application) {
  // 动态加载 vite 和 vue 插件，避免被 tsup 打包
  const { createServer: createViteServer } = await import('vite');
  const vuePlugin = (await import('@vitejs/plugin-vue')).default;

  const vite = await createViteServer({
    configFile: false,
    plugins: [vuePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    server: {
      port: 5000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: {
        overlay: true,
        path: '/hot/vite-hmr',
        port: 6000,
        clientPort: 443,
        timeout: 30000,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  console.log('Vite dev server initialized');
}

/**
 * 设置生产环境静态文件服务
 */
export function setupStaticServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error('dist folder not found. Please run "pnpm build" first.');
    process.exit(1);
  }

  app.use(express.static(distPath));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log('Serving static files from dist/');
}

/**
 * 根据环境设置 Vite
 */
export async function setupVite(app: Application) {
  if (isDev) {
    await setupViteMiddleware(app);
  } else {
    setupStaticServer(app);
  }
}
