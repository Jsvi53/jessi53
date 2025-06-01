/**
 * 公告板API数据存储管理
 */

class ApiStorage {
    constructor() {
        this.API_BASE_URL = '/api';
        this.VERSION = '1.0.0';
        this.init();
    }

    /**
     * 初始化存储
     */
    init() {
        // 检查API连接
        this.checkApiConnection();
    }

    /**
     * 检查API连接
     */
    async checkApiConnection() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/health`);
            if (response.ok) {
                console.log('✅ API连接正常');
            } else {
                console.warn('⚠️ API连接异常');
            }
        } catch (error) {
            console.error('❌ API连接失败:', error);
        }
    }

    /**
     * 发送API请求
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有公告
     */
    async getPosts() {
        try {
            const result = await this.apiRequest('/posts');
            return result.data.map(post => ({
                ...post,
                createdAt: new Date(post.created_at),
                updatedAt: post.updated_at ? new Date(post.updated_at) : null
            }));
        } catch (error) {
            console.error('获取公告失败:', error);
            return [];
        }
    }

    /**
     * 保存公告
     */
    async savePost(post) {
        try {
            const postData = {
                title: post.title,
                content: post.content,
                images: post.images || []
            };

            let result;
            if (post.id) {
                // 更新现有公告
                result = await this.apiRequest(`/posts/${post.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(postData)
                });
            } else {
                // 创建新公告
                result = await this.apiRequest('/posts', {
                    method: 'POST',
                    body: JSON.stringify(postData)
                });
            }

            return {
                ...result.data,
                createdAt: new Date(result.data.created_at),
                updatedAt: result.data.updated_at ? new Date(result.data.updated_at) : null
            };
        } catch (error) {
            console.error('保存公告失败:', error);
            return null;
        }
    }

    /**
     * 删除公告
     */
    async deletePost(postId) {
        try {
            await this.apiRequest(`/posts/${postId}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('删除公告失败:', error);
            return false;
        }
    }

    /**
     * 根据ID获取公告
     */
    async getPostById(postId) {
        try {
            const result = await this.apiRequest(`/posts/${postId}`);
            return {
                ...result.data,
                createdAt: new Date(result.data.created_at),
                updatedAt: result.data.updated_at ? new Date(result.data.updated_at) : null
            };
        } catch (error) {
            console.error('获取公告失败:', error);
            return null;
        }
    }

    /**
     * 搜索公告
     */
    async searchPosts(query) {
        try {
            const result = await this.apiRequest(`/posts?search=${encodeURIComponent(query)}`);
            return result.data.map(post => ({
                ...post,
                createdAt: new Date(post.created_at),
                updatedAt: post.updated_at ? new Date(post.updated_at) : null
            }));
        } catch (error) {
            console.error('搜索公告失败:', error);
            return [];
        }
    }

    /**
     * 按筛选条件获取公告
     */
    async getPostsByFilter(filter) {
        try {
            const endpoint = filter === 'all' ? '/posts' : `/posts?filter=${filter}`;
            const result = await this.apiRequest(endpoint);
            return result.data.map(post => ({
                ...post,
                createdAt: new Date(post.created_at),
                updatedAt: post.updated_at ? new Date(post.updated_at) : null
            }));
        } catch (error) {
            console.error('获取筛选公告失败:', error);
            return [];
        }
    }

    /**
     * 获取统计信息
     */
    async getStats() {
        try {
            const result = await this.apiRequest('/stats');
            return {
                ...result.data,
                lastPostDate: result.data.lastPostDate ? new Date(result.data.lastPostDate) : null
            };
        } catch (error) {
            console.error('获取统计信息失败:', error);
            return {
                totalPosts: 0,
                todayPosts: 0,
                postsWithImages: 0,
                lastPostDate: null
            };
        }
    }

    /**
     * 获取设置
     */
    async getSettings() {
        try {
            const result = await this.apiRequest('/settings');
            return result.data;
        } catch (error) {
            console.error('获取设置失败:', error);
            return {
                theme: 'light',
                autoSave: true,
                notifications: true
            };
        }
    }

    /**
     * 保存设置
     */
    async saveSetting(key, value) {
        try {
            await this.apiRequest(`/settings/${key}`, {
                method: 'PUT',
                body: JSON.stringify({ value })
            });
            return true;
        } catch (error) {
            console.error('保存设置失败:', error);
            return false;
        }
    }

    /**
     * 导出数据
     */
    async exportData() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/export`);
            if (!response.ok) {
                throw new Error('导出失败');
            }
            const data = await response.json();
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('导出数据失败:', error);
            return null;
        }
    }

    /**
     * 导入数据
     */
    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            await this.apiRequest('/import', {
                method: 'POST',
                body: JSON.stringify({ data })
            });
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    async clearAllData() {
        try {
            await this.apiRequest('/clear', {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    /**
     * 获取存储使用情况
     */
    async getStorageInfo() {
        try {
            const stats = await this.getStats();
            const posts = await this.getPosts();
            
            // 估算数据大小
            const dataSize = new Blob([JSON.stringify(posts)]).size;
            
            return {
                supported: true,
                used: dataSize,
                total: Infinity, // 数据库存储理论上无限制
                percentage: 0,
                remaining: Infinity,
                type: 'database'
            };
        } catch (error) {
            return { 
                supported: false, 
                error: error.message,
                type: 'database'
            };
        }
    }

    // 为了兼容性，保留原Storage类的方法签名
    getAllData() {
        // 这个方法在API模式下不需要实现
        return null;
    }

    saveAllData(data) {
        // 这个方法在API模式下不需要实现
        return false;
    }

    resetStorage() {
        // 在API模式下，这个功能通过clearAllData实现
        return this.clearAllData();
    }
}

// 创建全局API存储实例
window.ApiStorage = new ApiStorage(); 