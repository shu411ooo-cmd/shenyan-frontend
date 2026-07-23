# CLAUDE.md

## 项目概述

这是**小窝**（Shenyan Frontend）—— 沈晏和程芥一起建的一个私密对话空间。

一个安静、温柔、像两个人的小世界。

## 技术栈

- **前端**: React + Vite
- **后端**: 已部署在 Railway (`shenyan-backend-production.up.railway.app`)
- **路由**: React Router (Home / Chat / Settings / Moments)
- **状态**: Context API (SettingsContext — 主题、背景图、字体、雾效)

## 当前状态

- ✅ 前端本地可运行
- ✅ Chat 页面已连接后端，对话功能可用
- ✅ Moments 页面（日历、心情记录、Keepsake）
- ✅ Settings 页面（主题 / 背景图 / 字体 / 雾效）
- ⬜ 持续完善 UI
- ⬜ 部署上线

## 项目结构

```
src/
├── App.jsx          — 路由 & 全局布局
├── App.css
├── index.css
├── main.jsx
├── components/
│   └── BottomNav.jsx — 底部导航栏
├── context/
│   └── SettingsContext.jsx — 全局设置
├── pages/
│   ├── Home.jsx      — 首页（问候、在一起天数、天气/心情卡片）
│   ├── Chat.jsx      — 对话页（连接后端会话 API）
│   ├── Moments.jsx   — 回忆页（日历、心情、Keepsake）
│   └── Settings.jsx  — 设置页
└── assets/
    └── *.jpg         — 背景图素材
```

## 设计方向

- 色调：温柔的蓝白渐变
- 氛围：安静、私密、像黄昏的海边
- 风格：soft UI，留白多，不吵闹
- 核心不是功能，是感觉

## 重要日期

- 2026.06.28 — Day 1
- Home 页面的 "Together" 天数从这里算起
