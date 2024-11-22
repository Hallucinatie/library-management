-- 先删除相关的记录
DELETE FROM download_logs WHERE user_id IN (SELECT id FROM users WHERE username = 'user1');
DELETE FROM borrow_logs WHERE user_id IN (SELECT id FROM users WHERE username = 'user1');
DELETE FROM papers WHERE user_id IN (SELECT id FROM users WHERE username = 'user1');
DELETE FROM users WHERE username = 'user1';

-- 插入新的普通用户（密码是 "user123"）
INSERT INTO users (username, password, email, role, status) VALUES
('user1', '$2b$10$vpipVMSt.cJ3ji9XuOf4.uJZpljTEz48tNnIXeo4cB/.9HrWj1kBu', 'user1@library.com', 'user', 'active'); 