-- 首先删除所有触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users CASCADE;
DROP TRIGGER IF EXISTS update_books_updated_at ON books CASCADE;
DROP TRIGGER IF EXISTS update_papers_updated_at ON papers CASCADE;

-- 然后删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 最后按照依赖关系顺序删除表（使用 CASCADE 确保相关的外键约束也被删除）
DROP TABLE IF EXISTS download_logs CASCADE;
DROP TABLE IF EXISTS borrow_logs CASCADE;
DROP TABLE IF EXISTS papers CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column(); 