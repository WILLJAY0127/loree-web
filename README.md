# 知鹿 Loree — Web 前端（Phase 5）

独立仓库 / 独立目录，与后端 **loree**（Spring Boot）分离。实现请严格对齐需求侧文档中的前端架构与 UI 规格。

## 相关路径（本机）

| 内容 | 路径 |
|------|------|
| 本前端工程 | `d:\myfile\myproject\loree-web` |
| 后端（Gradle / Modulith） | `d:\myfile\myproject\loree` |
| PRD、路线图、API 说明等 | `d:\myfile\myproject\需求文档\终版\` |
| 前端架构与工程结构约定 | `需求文档\终版\前端\前端技术架构设计文档.md` |
| UI 与页面规格 | `需求文档\终版\前端\UI 交互设计文档.md` |

## 技术栈（摘要）

Vite 6、React 19、TypeScript（strict）、TanStack Query、Zustand、**原生 `fetch` + `src/shared/api/http.ts` 薄封装**、React Router 7、**shadcn/ui 风格**（`src/components/ui`：Radix Slot + CVA + `tailwind-merge`，主题变量在 `src/index.css` 的 `@theme inline`）、Tailwind CSS v4（`@tailwindcss/vite` + `tw-animate-css`）。详见架构文档 **S1 / S3**。

## 本地开发

1. 启动后端（默认端口 **8080**）：

   ```bash
   cd d:\myfile\myproject\loree
   .\gradlew.bat :app:bootRun
   ```

2. 安装依赖并启动前端：

   ```bash
   cd d:\myfile\myproject\loree-web
   npm install
   npm run dev
   ```

3. 浏览器访问终端里打印的本地 URL（一般为 `http://localhost:5173`）。  
   对 `/api` 的请求会通过 **Vite 代理**转发到 `http://localhost:8080`，与后端 `application.yml` 一致。

4. 可选：复制 `.env.example` 为 `.env.development`，按需设置 `VITE_API_BASE_URL`（通常开发环境不必设置）。

## 目录约定（与架构文档对齐）

- `src/app/` — Providers、Router、主题等全局组装  
- `src/shared/` — API 客户端、角色 Store、通用组件与工具  
- `src/features/task|knowledge|review|...` — 按 BC / 模块拆分页面与业务组件  

**本仓库更细的工程约定**（表单、QueryKey、命名、何时拆组件）：见 [`docs/前端代码约定.md`](docs/前端代码约定.md)。里程碑进度见 [`docs/前端实施计划.md`](docs/前端实施计划.md)。

## 构建

```bash
npm run build
npm run preview
```

## Git

本目录为 **独立** Git 仓库（与 `loree` 无 submodule 关系）。初始化命令：

```bash
cd d:\myfile\myproject\loree-web
git init
git add .
git commit -m "chore: initial loree-web scaffold (Phase 5)"
```

如需推送到远端，自行 `git remote add origin <url>` 后 `git push`。

## Capacitor

打包 App 见架构文档 **S11**。本脚手架未预装 `@capacitor/cli`，避免后端同学机器上多余依赖；需要移动端时再按文档执行 `npm install @capacitor/core @capacitor/cli` 并生成 `capacitor.config.ts`。
