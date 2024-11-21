-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' 或 'user'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' 或 'inactive'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 图书表
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    category VARCHAR(50),
    publisher VARCHAR(100),
    publishDate DATE,
    location VARCHAR(50), -- 图书馆中的位置
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 论文表
CREATE TABLE papers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    abstract TEXT,
    keywords TEXT[],
    fileUrl VARCHAR(255) NOT NULL,
    isPublic BOOLEAN DEFAULT false,
    userId INTEGER REFERENCES users(id),
    downloadCount INTEGER DEFAULT 0,
    publicationDate DATE,
    category VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 借阅记录表
CREATE TABLE borrowLogs (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES users(id),
    bookId INTEGER REFERENCES books(id),
    borrowDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate TIMESTAMP NOT NULL,
    returnDate TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed', -- 'borrowed' 或 'returned'
    fine DECIMAL(10,2) DEFAULT 0.00, -- 逾期罚款
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 下载记录表
CREATE TABLE downloadLogs (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES users(id),
    paperId INTEGER REFERENCES papers(id),
    downloadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ipAddress VARCHAR(45),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_papers_userId ON papers(userId);
CREATE INDEX idx_borrowLogs_userId ON borrowLogs(userId);
CREATE INDEX idx_borrowLogs_bookId ON borrowLogs(bookId);
CREATE INDEX idx_downloadLogs_userId ON downloadLogs(userId);
CREATE INDEX idx_downloadLogs_paperId ON downloadLogs(paperId);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION updateUpdatedAtColumn()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_users_updatedAt
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION updateUpdatedAtColumn();

CREATE TRIGGER update_books_updatedAt
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION updateUpdatedAtColumn();

CREATE TRIGGER update_papers_updatedAt
    BEFORE UPDATE ON papers
    FOR EACH ROW
    EXECUTE FUNCTION updateUpdatedAtColumn();

CREATE TRIGGER update_borrowLogs_updatedAt
    BEFORE UPDATE ON borrowLogs
    FOR EACH ROW
    EXECUTE FUNCTION updateUpdatedAtColumn();

-- 添加一些基本约束
ALTER TABLE books ADD CONSTRAINT positive_quantity 
    CHECK (quantity >= 0);

ALTER TABLE papers ADD CONSTRAINT valid_downloadCount 
    CHECK (downloadCount >= 0);

ALTER TABLE borrowLogs ADD CONSTRAINT valid_dates 
    CHECK (dueDate > borrowDate);

-- 添加一些示例数据
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2b$10$xxxxxxxxxxx', 'admin@library.com', 'admin'),
('user1', '$2b$10$xxxxxxxxxxx', 'user1@example.com', 'user');

-- 添加一些示例图书
INSERT INTO books (title, author, isbn, quantity, description) VALUES
('计算机科学导论', '作者1', '9787111111111', 5, '计算机科学入门教材'),
('数据结构与算法', '作者2', '9787111111112', 3, '经典算法教材');

-- 添加一些示例论文
INSERT INTO papers (title, author, abstract, fileUrl, isPublic, userId) VALUES
('人工智能研究', '研究者1', '这是一篇关于AI的研究论文', '/papers/1.pdf', true, 1),
('机器学习应用', '研究者2', '这是一篇关于机器学习的论文', '/papers/2.pdf', false, 2); 