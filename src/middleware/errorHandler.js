const logger = require('../config/logger');

// 统一错误处理中间件
const errorHandler = (err, req, res, next) => {
    // 记录错误日志
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // 根据错误类型返回相应的状态码
    const statusCode = err.statusCode || 500;
    
    // 返回错误响应
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler; 