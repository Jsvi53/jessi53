const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化数据库
const db = new Database();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 静态文件服务 (为前端文件提供服务)
app.use(express.static(path.join(__dirname, '..')));

// API路由

// 获取所有公告
app.get('/api/posts', async (req, res) => {
    try {
        const { search, filter } = req.query;
        
        let posts;
        if (search) {
            posts = await db.searchPosts(search);
        } else {
            posts = await db.getAllPosts();
        }

        // 应用筛选
        if (filter) {
            switch (filter) {
                case 'today':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    posts = posts.filter(post => {
                        const postDate = new Date(post.created_at);
                        postDate.setHours(0, 0, 0, 0);
                        return postDate.getTime() === today.getTime();
                    });
                    break;
                case 'with-images':
                    posts = posts.filter(post => post.images && post.images.length > 0);
                    break;
            }
        }

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('获取公告失败:', error);
        res.status(500).json({
            success: false,
            error: '获取公告失败'
        });
    }
});

// 根据ID获取公告
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await db.getPostById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                error: '公告不存在'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('获取公告失败:', error);
        res.status(500).json({
            success: false,
            error: '获取公告失败'
        });
    }
});

// 创建新公告
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, images } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                error: '公告内容不能为空'
            });
        }

        const post = {
            id: uuidv4(),
            title: title || null,
            content: content.trim(),
            images: images || []
        };

        const savedPost = await db.createPost(post);
        
        res.status(201).json({
            success: true,
            data: savedPost
        });
    } catch (error) {
        console.error('创建公告失败:', error);
        res.status(500).json({
            success: false,
            error: '创建公告失败'
        });
    }
});

// 更新公告
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { title, content, images } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                error: '公告内容不能为空'
            });
        }

        // 检查公告是否存在
        const existingPost = await db.getPostById(req.params.id);
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                error: '公告不存在'
            });
        }

        const post = {
            id: req.params.id,
            title: title || null,
            content: content.trim(),
            images: images || []
        };

        const updatedPost = await db.updatePost(post);
        
        res.json({
            success: true,
            data: updatedPost
        });
    } catch (error) {
        console.error('更新公告失败:', error);
        res.status(500).json({
            success: false,
            error: '更新公告失败'
        });
    }
});

// 删除公告
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const success = await db.deletePost(req.params.id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                error: '公告不存在'
            });
        }

        res.json({
            success: true,
            message: '公告已删除'
        });
    } catch (error) {
        console.error('删除公告失败:', error);
        res.status(500).json({
            success: false,
            error: '删除公告失败'
        });
    }
});

// 获取统计信息
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({
            success: false,
            error: '获取统计信息失败'
        });
    }
});

// 获取设置
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.getAllSettings();
        
        // 提供默认设置
        const defaultSettings = {
            theme: 'light',
            autoSave: true,
            notifications: true
        };

        res.json({
            success: true,
            data: { ...defaultSettings, ...settings }
        });
    } catch (error) {
        console.error('获取设置失败:', error);
        res.status(500).json({
            success: false,
            error: '获取设置失败'
        });
    }
});

// 更新设置
app.put('/api/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        await db.setSetting(key, value);
        
        res.json({
            success: true,
            message: '设置已更新'
        });
    } catch (error) {
        console.error('更新设置失败:', error);
        res.status(500).json({
            success: false,
            error: '更新设置失败'
        });
    }
});

// 导出数据
app.get('/api/export', async (req, res) => {
    try {
        const posts = await db.getAllPosts();
        const settings = await db.getAllSettings();
        
        const exportData = {
            version: '1.0.0',
            posts: posts,
            settings: settings,
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=announcement_board_backup.json');
        res.json(exportData);
    } catch (error) {
        console.error('导出数据失败:', error);
        res.status(500).json({
            success: false,
            error: '导出数据失败'
        });
    }
});

// 导入数据
app.post('/api/import', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data || !data.posts || !Array.isArray(data.posts)) {
            return res.status(400).json({
                success: false,
                error: '无效的数据格式'
            });
        }

        // 导入公告
        for (const post of data.posts) {
            const postData = {
                id: post.id || uuidv4(),
                title: post.title,
                content: post.content,
                images: post.images || []
            };

            try {
                // 检查是否已存在
                const existing = await db.getPostById(postData.id);
                if (existing) {
                    await db.updatePost(postData);
                } else {
                    await db.createPost(postData);
                }
            } catch (error) {
                console.warn('导入公告失败:', post.id, error.message);
            }
        }

        // 导入设置
        if (data.settings) {
            for (const [key, value] of Object.entries(data.settings)) {
                try {
                    await db.setSetting(key, value);
                } catch (error) {
                    console.warn('导入设置失败:', key, error.message);
                }
            }
        }

        res.json({
            success: true,
            message: '数据导入成功'
        });
    } catch (error) {
        console.error('导入数据失败:', error);
        res.status(500).json({
            success: false,
            error: '导入数据失败'
        });
    }
});

// 清空所有数据
app.delete('/api/clear', async (req, res) => {
    try {
        await db.clearAllData();
        res.json({
            success: true,
            message: '所有数据已清空'
        });
    } catch (error) {
        console.error('清空数据失败:', error);
        res.status(500).json({
            success: false,
            error: '清空数据失败'
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API服务正常',
        timestamp: new Date().toISOString()
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            error: 'API接口不存在'
        });
    } else {
        // 对于非API请求，返回前端页面
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ 服务器启动成功！`);
    console.log(`🌐 本地访问地址: http://localhost:${PORT}`);
    console.log(`📡 API根路径: http://localhost:${PORT}/api`);
    console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    try {
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('关闭服务器时出错:', error);
        process.exit(1);
    }
}); 