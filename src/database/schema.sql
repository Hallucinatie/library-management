-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' 或 'user'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' 或 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    publish_date DATE,
    location VARCHAR(50), -- 图书馆中的位置
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 论文表
CREATE TABLE papers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    abstract TEXT,
    keywords TEXT[],
    file_url VARCHAR(255) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    user_id INTEGER REFERENCES users(id),
    download_count INTEGER DEFAULT 0,
    publication_date DATE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 借阅记录表
CREATE TABLE borrow_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    book_id INTEGER REFERENCES books(id),
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed', -- 'borrowed' 或 'returned'
    fine DECIMAL(10,2) DEFAULT 0.00, -- 逾期罚款
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 下载记录表
CREATE TABLE download_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    paper_id INTEGER REFERENCES papers(id),
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_papers_user_id ON papers(user_id);
CREATE INDEX idx_borrow_logs_user_id ON borrow_logs(user_id);
CREATE INDEX idx_borrow_logs_book_id ON borrow_logs(book_id);
CREATE INDEX idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX idx_download_logs_paper_id ON download_logs(paper_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_papers_updated_at
    BEFORE UPDATE ON papers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrow_logs_updated_at
    BEFORE UPDATE ON borrow_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加一些基本约束
ALTER TABLE books ADD CONSTRAINT positive_quantity 
    CHECK (quantity >= 0);

ALTER TABLE papers ADD CONSTRAINT valid_download_count 
    CHECK (download_count >= 0);

ALTER TABLE borrow_logs ADD CONSTRAINT valid_dates 
    CHECK (due_date > borrow_date);

-- 添加一些示例数据
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2b$10$xxxxxxxxxxx', 'admin@library.com', 'admin'),
('user1', '$2b$10$xxxxxxxxxxx', 'user1@example.com', 'user');

-- 添加一些示例图书
INSERT INTO books (title, author, isbn, quantity, description) VALUES
('计算机科学导论', '作者1', '9787111111111', 5, '计算机科学入门教材'),
('数据结构与算法', '作者2', '9787111111112', 3, '经典算法教材');

-- 添加一些示例论文
INSERT INTO papers (title, author, abstract, file_url, is_public, user_id) VALUES
('人工智能研究', '研究者1', '这是一篇关于AI的研究论文', '/papers/1.pdf', true, 1),
('机器学习应用', '研究者2', '这是一篇关于机器学习的论文', '/papers/2.pdf', false, 2); 