# 图书馆管理系统后端

基于 Node.js + Express + PostgreSQL 的图书馆管理系统后端服务。

## 功能特性

### 用户管理
- 用户注册/登录
- 邮箱验证和密码重置
- 用户状态管理（活跃/禁用）

### 图书管理
- 图书的增删改查
- 库存管理

### 论文管理
- 论文的增删改查
- PDF文件上传和存储
- 公开/私有权限控制
- 下载次数统计

### 借阅管理
- 图书借阅和归还
- 借阅期限管理
- 借阅历史记录

### 下载管理
- 论文下载记录
- 下载统计

## 技术栈

- **Node.js**: 运行环境
- **Express**: Web 框架
- **PostgreSQL**: 数据库
- **JWT**: 身份认证
- **Bcrypt**: 密码加密
- **Nodemailer**: 邮件服务
- **MinIO**: 文件存储

## 项目结构
```
.
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── guestController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/
│   │   ├── book.js
│   │   ├── paper.js
│   │   ├── user.js
│   │   └── borrowLog.js
│   │   └── downloadLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── user.js
│   │   └── guest.js
│   └── app.js
├── .env # 数据库配置
└── package.json 
```

## 快速开始

1. 安装依赖
    ```bash
    npm install
    ```

2. 启动服务器
    ```bash
    npm run dev

3. 配置数据库与环境变量
    ```bash
    cp .env.example .env
    ```

4. 初始化数据库(可选)
    ```bash
    sh init_database.sh
    ```

## 环境变量配置

项目使用 `.env` 文件管理环境变量，在运行项目前需要正确配置以下环境变量：

### 数据库配置
- `DB_HOST`: 数据库主机地址
- `DB_PORT`: 数据库端口
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码

### JWT配置
- `JWT_SECRET`: JWT 加密密钥

### 邮箱配置
- `EMAIL_USER`: 邮箱账号
- `EMAIL_PASS`: 邮箱授权码
- `EMAIL_HOST`: SMTP服务器地址
- `EMAIL_PORT`: SMTP服务器端口

创建 `.env` 文件：
```bash
cp .env.example .env
# 然后编辑 .env 文件，填入实际的配置值
```
