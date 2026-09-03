# 项目上下文

## 项目概述

VerbFlow - 基于大模型场景扮演的英语口语训练系统。前端 Vue 3 + 后端 Express，集成 LLM 对话、TTS 语音合成、ASR 语音识别。

## 技术栈

- **前端**: Vue 3, Vue Router 4, Pinia, TypeScript, Tailwind CSS 3
- **后端**: Express 4, TypeScript
- **AI 集成**: coze-coding-dev-sdk (LLM + TTS + ASR)
- **构建**: Vite 7

## 目录结构

```
├── scripts/            # 构建与启动脚本
├── server/             # 服务端逻辑
│   ├── routes/         # API 路由
│   │   ├── index.ts    # 路由注册
│   │   ├── chat.ts     # LLM 对话流式 API
│   │   ├── tts.ts      # TTS 语音合成 API
│   │   ├── asr.ts      # ASR 语音识别 API
│   │   └── assessment.ts # 发音评估 API
│   ├── server.ts       # Express 入口
│   └── vite.ts         # Vite 中间件
├── src/                # 前端 Vue 源码
│   ├── main.ts         # Vue 入口
│   ├── App.vue         # 根组件(导航+路由)
│   ├── index.css       # 全局样式(Tailwind)
│   ├── env.d.ts        # 类型声明
│   ├── router/         # Vue Router 路由配置
│   ├── stores/         # Pinia 状态管理
│   │   ├── user.ts     # 用户信息 store
│   │   └── chat.ts     # 对话/场景 store
│   └── views/          # 页面组件
│       ├── HomePage.vue      # 首页
│       ├── SceneSelect.vue   # 场景选择
│       ├── ChatRoom.vue      # 对话页面(核心)
│       ├── Assessment.vue    # 会话评估结果
│       ├── PlacementTest.vue # 入学测试
│       ├── LearningPlan.vue  # 学习计划
│       └── Community.vue     # 学习社区
├── index.html          # HTML 入口
├── vite.config.ts      # Vite 配置(含 Vue 插件)
└── tsconfig.json       # TypeScript 配置
```

## API 接口

| 路径 | 方法 | 说明 |
|------|------|------|
| /api/health | GET | 健康检查 |
| /api/chat/stream | POST | LLM 流式对话(SSE) |
| /api/chat/evaluate | POST | 对话评估 |
| /api/tts/synthesize | POST | 文本转语音 |
| /api/asr/recognize | POST | 语音识别 |
| /api/assessment/evaluate | POST | 发音/语法评估 |

## 包管理规范

**仅允许使用 pnpm** 作为包管理器。

## 编码规范

- TypeScript `strict` 模式，禁止隐式 `any`
- Vue 3 Composition API + `<script setup>` 语法
- Pinia 状态管理
- Tailwind CSS 样式
