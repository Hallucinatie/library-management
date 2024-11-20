# 图书馆管理系统后端 API

这是一个基于 Node.js 和 Express 框架开发的图书馆管理系统后端 API，提供图书和论文的管理、借阅等功能。

## Git Flow 开发流程

为了更好地进行团队协作开发，我们采用 Git Flow 工作流程。主要分支说明如下：

### 主要分支
- `main`: 主分支，用于存放正式发布的版本
- `develop`: 开发分支，用于日常开发工作

### 功能开发
1. 从 `develop` 分支创建新的功能分支：
   ```bash
   git checkout -b feature/your-feature develop
   ```
2. 在功能分支上进行开发
3. 完成后合并回 `develop` 分支：
   ```bash
   git checkout develop
   git merge --no-ff feature/your-feature
   ```

### 紧急修复
1. 从 `main` 分支创建修复分支：
   ```bash
   git checkout -b hotfix/bug-fix main
   ```
2. 修复完成后合并到 `main` 和 `develop` 分支：
   ```bash
   git checkout main
   git merge --no-ff hotfix/bug-fix
   git tag -a v1.0.1
   
   git checkout develop
   git merge --no-ff hotfix/bug-fix
   ```


