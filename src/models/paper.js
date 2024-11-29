const { pool } = require("../config/database");

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const Minio = require('minio');

// 初始化 MinIO 客户端
const minioClient = new Minio.Client({
  endPoint: '47.96.95.171', // MinIO 服务器的 IP 地址
  port: 9000,  // MinIO API 端口，默认 9000
  useSSL: false,  // 如果 MinIO 使用 HTTPS，设为 true，否则设为 false
  accessKey: 'shiluohe',  // MinIO 访问密钥
  secretKey: 'shiluohe123'   // MinIO 秘密密钥
});

class Paper {
  // 将数据库蛇形命名转换为驼峰命名
  static _convertToCamelCase(paper) {
    if (!paper) return null;

    return {
      id: paper.id,
      title: paper.title,
      author: paper.author,
      abstract: paper.abstract,
      keywords: paper.keywords,
      fileUrl: paper.file_url,
      isPublic: paper.is_public,
      userId: paper.user_id,
      downloadCount: paper.download_count,
      publicationDate: paper.publication_date,
      category: paper.category,
      createdAt: paper.created_at,
      updatedAt: paper.updated_at,
    };
  }

  // 将驼峰命名转换为数据库蛇形命名
  static _convertToSnakeCase(paperData) {
    const converted = {};
    if (paperData.fileUrl) converted.file_url = paperData.fileUrl;
    if (paperData.isPublic !== undefined)
      converted.is_public = paperData.isPublic;
    if (paperData.userId) converted.user_id = paperData.userId;
    if (paperData.publicationDate)
      converted.publication_date = paperData.publicationDate;
    if (paperData.downloadCount)
      converted.download_count = paperData.downloadCount;
    if (paperData.updatedAt) converted.updated_at = paperData.updatedAt;
    if (paperData.createdAt) converted.created_at = paperData.createdAt;

    // 保持原样的字段
    if (paperData.title) converted.title = paperData.title;
    if (paperData.author) converted.author = paperData.author;
    if (paperData.abstract) converted.abstract = paperData.abstract;
    if (paperData.keywords) converted.keywords = paperData.keywords;
    if (paperData.category) converted.category = paperData.category;

    return converted;
  }

  static async create(paperData) {
    const snakeCaseData = this._convertToSnakeCase(paperData);

    const query = `
        INSERT INTO papers (
            title, author, abstract, keywords, file_url, is_public, 
            user_id, category, publication_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    const values = [
      paperData.title,
      paperData.author,
      paperData.abstract,
      paperData.keywords,
      snakeCaseData.file_url,
      snakeCaseData.is_public,
      snakeCaseData.user_id,
      paperData.category,
      snakeCaseData.publication_date,
    ];

    try {
      const { rows } = await pool.query(query, values);
      return this._convertToCamelCase(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async update(id, paperData) {
    const snakeCaseData = this._convertToSnakeCase(paperData);

    // 构建更新字段
    const updateFields = [];
    const values = [id];
    let paramCount = 2;

    Object.entries(snakeCaseData).forEach(([key, value]) => {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    // 如果没有要更新的字段，返回null
    if (updateFields.length === 0) {
      return null;
    }

    const query = `
        UPDATE papers 
            SET ${updateFields.join(", ")}
            WHERE id = $1
            RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return this._convertToCamelCase(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const query = `
            DELETE FROM papers 
            WHERE id = $1 
            RETURNING *
        `;

    try {
      const { rows } = await pool.query(query, [id]);
      return this._convertToCamelCase(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findAll(isPublicOnly = false) {
    const query = isPublicOnly
      ? "SELECT * FROM papers WHERE is_public = true ORDER BY created_at DESC"
      : "SELECT * FROM papers ORDER BY created_at DESC";
    const { rows } = await pool.query(query);
    return rows.map((row) => this._convertToCamelCase(row));
  }

  static async findById(id) {
    const query = "SELECT * FROM papers WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return this._convertToCamelCase(rows[0]);
  }

  static async incrementDownloadCount(id) {
    const query = `
            UPDATE papers 
            SET download_count = download_count + 1 
            WHERE id = $1 
            RETURNING *
        `;
    const { rows } = await pool.query(query, [id]);
    return this._convertToCamelCase(rows[0]);
  }

  static async findByUserId(userId) {
    const query =
      "SELECT * FROM papers WHERE user_id = $1 ORDER BY created_at DESC";
    const { rows } = await pool.query(query, [userId]);
    return rows.map((row) => this._convertToCamelCase(row));
  }

  static async findByQuery(queryParams = {}) {
    let query = "SELECT * FROM papers WHERE 1=1";
    const values = [];
    let paramCount = 1;

    // 精确匹配ID
    if (queryParams.id) {
      query += ` AND id = $${paramCount}`;
      values.push(queryParams.id);
      paramCount++;
    }

    // 模糊匹配其他字段
    const likeFields = {
      title: "title",
      author: "author",
      category: "category",
    };

    Object.entries(likeFields).forEach(([param, field]) => {
      if (queryParams[param]) {
        query += ` AND ${field} ILIKE $${paramCount}`;
        values.push(`%${queryParams[param]}%`);
        paramCount++;
      }
    });

    if (queryParams.userId) {
      query += ` AND (user_id = $${paramCount} OR is_public = true)`;
      values.push(queryParams.userId);
      paramCount++;
    }

    query += " ORDER BY created_at ASC";

    const { rows } = await pool.query(query, values);
    return rows.map((row) => this._convertToCamelCase(row));
  }
    
    static async uploadFile(bucketName, filePath) {
        return new Promise((resolve, reject) => {
            // 确保文件路径存在
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return reject('File not found');
                }
                
                const fileName = path.basename(filePath)

                // 上传文件到 MinIO
                minioClient.fPutObject(bucketName, fileName, filePath, function(err, etag) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(`File ${fileName} uploaded successfully`);
                    }
                });
            });
        });
    }

    static async downloadFile(bucketName, fileName, downloadPath) {
        return new Promise((resolve, reject) => {
            minioClient.fGetObject(bucketName, fileName, downloadPath, function(err) {
                if (err) {
                    if (err.code === 'NoSuchKey') {
                        resolve(null);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(`File ${fileName} downloaded to ${downloadPath}`);
                }
            });
        });
    }

    static async downloadFileExternal(urlStr, destPath) {
        return new Promise((resolve, reject) => {
            const mod = https;
          
            // 创建可写流，指定保存文件的路径
            const file = fs.createWriteStream(destPath);
          
            // 发起 HTTP 请求
            const request = mod.get(urlStr, (response) => {
                // 如果响应的状态码不是 200，表示文件下载失败
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
                    return;
                }
          
                // 将响应流写入到文件
                response.pipe(file);
          
                // 下载完成后，关闭文件流并 resolve
                file.on('finish', () => {
                    file.close();
                    resolve(`File downloaded successfully to ${destPath}`);
                });
            });
          
            // 监听请求错误
            request.on('error', (err) => {
                fs.unlink(destPath, () => {}); // 如果下载失败，删除部分下载的文件
                reject(new Error(`Failed to download file: ${err.message}`));
            });
          
              // 处理下载中断的情况
            request.on('abort', () => {
                fs.unlink(destPath, () => {});
                reject(new Error('Download aborted.'));
            });
        });
    }

    static async clearDirectory(dirPath) {

        let totalSize = 0;
        const fileInfo = [];

        // 读取目录中的所有文件
        const files = fs.readdirSync(dirPath);

        // 遍历文件并删除
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            if (fs.lstatSync(filePath).isFile()) {
                const fileSize = fs.lstatSync(filePath).size;
                fs.unlinkSync(filePath);
                fileInfo.push({ name: file, size: fileSize });
                totalSize += fileSize;
            }
        });

        return { cleanedFiles: fileInfo, totalSize };
    }

}

module.exports = Paper;
