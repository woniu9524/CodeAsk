# CodeAsk

<div align="center">
  <img src="images/logo.png" alt="CodeAsk Logo" width="200"/>
  <h3>CodeAsk - 代码分析工具</h3>
</div>

<div align="center">

[![License](https://img.shields.io/badge/license-GNU-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-%5E19.0.0-blue.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/electron-latest-blueviolet.svg)](https://www.electronjs.org/)

</div>

## 📖 简介

CodeAsk是一款基于大模型代码分析工具，它可以提供智能的代码梳理与分析，安全漏洞检测，质量评估等能力，帮助你快速熟悉代码。

## 🎥 预览

<div align="center">
  <img src="images/demo-zh.gif" alt="CodeAsk Demo" width="800"/>
</div>

## 🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/codeask.git
```

2. 安装依赖
```bash
cd codeask
npm install
```

3. 启动应用
```bash
npm run start
```

## 💡 使用指南

### 1. 项目配置
- 通过 `文件 > 打开文件夹` 选择目标代码目录
- 在模型设置中配置您的 LLM API 密钥和参数

### 2. 插件创建与代码分析
1. 创建插件
2. 选择合适的分析插件
3. 启动分析任务完成分析

### 3. 结果查看
- 支持分屏对比查看
- Markdown 格式报告展示
- markdown中支持mermaid图表展示

## 🔧 技术栈

- **核心框架**
  - React 19
  - Electron
  - TypeScript
  
- **状态管理**
  - Zustand
  
- **UI 组件**
  - Shadcn/ui
  - CodeMirror
  - ReactMarkdown
  
- **开发工具**
  - Vite
  - ESLint
  - Prettier
