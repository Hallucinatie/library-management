-- 首先删除所有触发器
DROP TRIGGER IF EXISTS update_users_updatedat ON users CASCADE;
DROP TRIGGER IF EXISTS update_books_updatedat ON books CASCADE;
DROP TRIGGER IF EXISTS update_papers_updatedat ON papers CASCADE;

-- 然后删除触发器函数
DROP FUNCTION IF EXISTS updateUpdatedAtColumn() CASCADE;

-- 最后按照依赖关系顺序删除表（使用 CASCADE 确保相关的外键约束也被删除）
DROP TABLE IF EXISTS downloadLogs CASCADE;
DROP TABLE IF EXISTS borrowLogs CASCADE;
DROP TABLE IF EXISTS papers CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS updateUpdatedAtColumn(); 