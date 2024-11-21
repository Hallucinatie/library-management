-- 先删除相关的记录
DELETE FROM downloadLogs WHERE userId IN (SELECT id FROM users WHERE username = 'admin');
DELETE FROM borrowLogs WHERE userId IN (SELECT id FROM users WHERE username = 'admin');
DELETE FROM papers WHERE userId IN (SELECT id FROM users WHERE username = 'admin');
DELETE FROM users WHERE username = 'admin';

-- 插入新的 admin 用户（密码是 "admin123"）
INSERT INTO users (username, password, email, role, status) VALUES
('admin', '$2b$10$7NipB3ywR8Hl9EqSe..lh.a0vtejc79Oij0Hibb3x6Q3hOZPJlvx2', 'admin@library.com', 'admin', 'active'); 