# ljw-cli

一个用于拉取并初始化项目模板的轻量脚手架工具。

## 安装

```bash
npm install -g ljw-cli
```

## 当前可用模板

```bash
ljw-cli list
```

当前默认模板里已经包含：

- `vue-simple`：Vue 3 + Vite + TypeScript 模板
- `webpack-simple`：Webpack 基础模板
- `koa-simple`：Koa 基础模板

## 初始化项目

### 交互式初始化

```bash
ljw-cli init
```

### 直接指定模板和项目名

```bash
ljw-cli init vue-simple my-app
```

执行后会继续提示你输入：

- 项目简介
- 作者名称
- 包管理器
- 是否立即安装依赖

## 前置要求

- 本机需要已安装 Git，并且 `git` 命令可直接使用

## 当前初始化流程

```text
选择模板
-> 输入项目名
-> 使用 Git 浅克隆模板仓库
-> 改写 package.json / package-lock.json
-> 替换模板中的项目名标识
-> 按需安装依赖
```

## 说明

- 现在不再依赖 `package.json` 中的 Handlebars 占位符
- `vue-simple` 模板可以直接生成基于 Vue 3 + Vite + TypeScript 的项目
- Windows 下会自动使用 `npm.cmd / pnpm.cmd / yarn.cmd` 安装依赖
- 当选择 `pnpm` 或 `yarn` 时，会自动移除模板里的 `package-lock.json`

