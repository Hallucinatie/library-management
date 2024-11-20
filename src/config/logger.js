const winston = require('winston');

// 创建日志记录器
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    transports: [
        // 错误日志写入文件
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        // 所有日志写入文件
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

// 在非生产环境下，同时将日志打印到控制台
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger; 