const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'announcement_board.db');
        this.db = null;
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('数据库连接失败:', err.message);
                    reject(err);
                } else {
                    console.log('数据库连接成功');
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    createTables() {
        return new Promise((resolve, reject) => {
            const createPostsTable = `
                CREATE TABLE IF NOT EXISTS posts (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createImagesTable = `
                CREATE TABLE IF NOT EXISTS post_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    post_id TEXT NOT NULL,
                    image_data TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
                )
            `;

            const createSettingsTable = `
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createIndexes = `
                CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images(post_id);
            `;

            this.db.exec(createPostsTable + createImagesTable + createSettingsTable + createIndexes, (err) => {
                if (err) {
                    console.error('创建表失败:', err.message);
                    reject(err);
                } else {
                    console.log('数据库表创建成功');
                    resolve();
                }
            });
        });
    }

    // 公告相关方法
    async getAllPosts() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, GROUP_CONCAT(pi.image_data) as images
                FROM posts p
                LEFT JOIN post_images pi ON p.id = pi.post_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;

            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const posts = rows.map(row => ({
                        ...row,
                        images: row.images ? row.images.split(',') : [],
                        created_at: new Date(row.created_at),
                        updated_at: row.updated_at ? new Date(row.updated_at) : null
                    }));
                    resolve(posts);
                }
            });
        });
    }

    async getPostById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, GROUP_CONCAT(pi.image_data) as images
                FROM posts p
                LEFT JOIN post_images pi ON p.id = pi.post_id
                WHERE p.id = ?
                GROUP BY p.id
            `;

            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    const post = {
                        ...row,
                        images: row.images ? row.images.split(',') : [],
                        created_at: new Date(row.created_at),
                        updated_at: row.updated_at ? new Date(row.updated_at) : null
                    };
                    resolve(post);
                } else {
                    resolve(null);
                }
            });
        });
    }

    async createPost(post) {
        return new Promise((resolve, reject) => {
            const { id, title, content, images = [] } = post;
            
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                // 插入公告
                const insertPost = `
                    INSERT INTO posts (id, title, content, created_at, updated_at)
                    VALUES (?, ?, ?, datetime('now'), datetime('now'))
                `;

                this.db.run(insertPost, [id, title, content], function(err) {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    // 插入图片
                    if (images.length > 0) {
                        const insertImage = `INSERT INTO post_images (post_id, image_data) VALUES (?, ?)`;
                        
                        let completed = 0;
                        let hasError = false;

                        images.forEach(imageData => {
                            this.db.run(insertImage, [id, imageData], (err) => {
                                if (err && !hasError) {
                                    hasError = true;
                                    this.db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }

                                completed++;
                                if (completed === images.length && !hasError) {
                                    this.db.run('COMMIT', (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve({ ...post, created_at: new Date(), updated_at: new Date() });
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        this.db.run('COMMIT', (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({ ...post, created_at: new Date(), updated_at: new Date() });
                            }
                        });
                    }
                }.bind(this));
            });
        });
    }

    async updatePost(post) {
        return new Promise((resolve, reject) => {
            const { id, title, content, images = [] } = post;
            
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                // 更新公告
                const updatePost = `
                    UPDATE posts 
                    SET title = ?, content = ?, updated_at = datetime('now')
                    WHERE id = ?
                `;

                this.db.run(updatePost, [title, content, id], function(err) {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    // 删除旧图片
                    this.db.run('DELETE FROM post_images WHERE post_id = ?', [id], (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        // 插入新图片
                        if (images.length > 0) {
                            const insertImage = `INSERT INTO post_images (post_id, image_data) VALUES (?, ?)`;
                            
                            let completed = 0;
                            let hasError = false;

                            images.forEach(imageData => {
                                this.db.run(insertImage, [id, imageData], (err) => {
                                    if (err && !hasError) {
                                        hasError = true;
                                        this.db.run('ROLLBACK');
                                        reject(err);
                                        return;
                                    }

                                    completed++;
                                    if (completed === images.length && !hasError) {
                                        this.db.run('COMMIT', (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve({ ...post, updated_at: new Date() });
                                            }
                                        });
                                    }
                                });
                            });
                        } else {
                            this.db.run('COMMIT', (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ ...post, updated_at: new Date() });
                                }
                            });
                        }
                    });
                }.bind(this));
            });
        });
    }

    async deletePost(id) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                // 删除图片
                this.db.run('DELETE FROM post_images WHERE post_id = ?', [id], (err) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    // 删除公告
                    this.db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                        } else {
                            this.db.run('COMMIT', (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(this.changes > 0);
                                }
                            });
                        }
                    }.bind(this));
                });
            });
        });
    }

    async searchPosts(query) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, GROUP_CONCAT(pi.image_data) as images
                FROM posts p
                LEFT JOIN post_images pi ON p.id = pi.post_id
                WHERE p.title LIKE ? OR p.content LIKE ?
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `;

            const searchTerm = `%${query}%`;
            this.db.all(sql, [searchTerm, searchTerm], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const posts = rows.map(row => ({
                        ...row,
                        images: row.images ? row.images.split(',') : [],
                        created_at: new Date(row.created_at),
                        updated_at: row.updated_at ? new Date(row.updated_at) : null
                    }));
                    resolve(posts);
                }
            });
        });
    }

    async getStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as totalPosts,
                    COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as todayPosts,
                    COUNT(CASE WHEN pi.post_id IS NOT NULL THEN 1 END) as postsWithImages,
                    MAX(created_at) as lastPostDate
                FROM posts p
                LEFT JOIN post_images pi ON p.id = pi.post_id
            `;

            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        totalPosts: row.totalPosts || 0,
                        todayPosts: row.todayPosts || 0,
                        postsWithImages: row.postsWithImages || 0,
                        lastPostDate: row.lastPostDate ? new Date(row.lastPostDate) : null
                    });
                }
            });
        });
    }

    // 设置相关方法
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT value FROM settings WHERE key = ?';
            this.db.get(sql, [key], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? JSON.parse(row.value) : null);
                }
            });
        });
    }

    async setSetting(key, value) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, datetime('now'))
            `;
            
            this.db.run(sql, [key, JSON.stringify(value)], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    async getAllSettings() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT key, value FROM settings';
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const settings = {};
                    rows.forEach(row => {
                        settings[row.key] = JSON.parse(row.value);
                    });
                    resolve(settings);
                }
            });
        });
    }

    async clearAllData() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                this.db.run('DELETE FROM post_images', (err) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    this.db.run('DELETE FROM posts', (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        this.db.run('DELETE FROM settings', (err) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                reject(err);
                            } else {
                                this.db.run('COMMIT', (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('数据库连接已关闭');
                    resolve();
                }
            });
        });
    }
}

module.exports = Database; 