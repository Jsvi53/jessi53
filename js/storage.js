/**
 * 公告板数据存储管理
 */

class Storage {
    constructor() {
        this.STORAGE_KEY = 'announcement_board';
        this.VERSION = '1.0.0';
        this.init();
    }

    /**
     * 初始化存储
     */
    init() {
        if (!Utils.Browser.supports('localStorage')) {
            console.warn('浏览器不支持 localStorage，数据将无法持久化保存');
            return;
        }

        const data = this.getAllData();
        if (!data || data.version !== this.VERSION) {
            this.resetStorage();
        }
    }

    /**
     * 获取所有数据
     */
    getAllData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }

    /**
     * 保存所有数据
     */
    saveAllData(data) {
        try {
            data.version = this.VERSION;
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    /**
     * 重置存储
     */
    resetStorage() {
        const initialData = {
            version: this.VERSION,
            posts: [],
            settings: {
                theme: 'light',
                autoSave: true,
                notifications: true
            },
            stats: {
                totalPosts: 0,
                lastPostDate: null
            },
            lastUpdated: new Date().toISOString()
        };

        this.saveAllData(initialData);
    }

    /**
     * 获取所有公告
     */
    getPosts() {
        const data = this.getAllData();
        if (!data || !data.posts) return [];
        
        // 将字符串日期转换回 Date 对象
        return data.posts.map(post => ({
            ...post,
            createdAt: new Date(post.createdAt),
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : null
        }));
    }

    /**
     * 保存公告
     */
    savePost(post) {
        const data = this.getAllData() || { posts: [], stats: { totalPosts: 0 } };
        
        // 生成新的ID（如果是新公告）
        if (!post.id) {
            post.id = Utils.String.generateId();
            post.createdAt = new Date();
            data.posts.unshift(post); // 新公告添加到开头
            data.stats.totalPosts++;
        } else {
            // 更新现有公告
            const index = data.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                post.updatedAt = new Date();
                data.posts[index] = post;
            }
        }

        data.stats.lastPostDate = new Date().toISOString();
        return this.saveAllData(data) ? post : null;
    }

    /**
     * 删除公告
     */
    deletePost(postId) {
        const data = this.getAllData();
        if (!data || !data.posts) return false;

        const initialLength = data.posts.length;
        data.posts = data.posts.filter(post => post.id !== postId);
        
        if (data.posts.length < initialLength) {
            data.stats.totalPosts = data.posts.length;
            return this.saveAllData(data);
        }
        
        return false;
    }

    /**
     * 根据ID获取公告
     */
    getPostById(postId) {
        const posts = this.getPosts();
        return posts.find(post => post.id === postId) || null;
    }

    /**
     * 搜索公告
     */
    searchPosts(query) {
        const posts = this.getPosts();
        if (!query || query.trim() === '') return posts;

        const searchTerm = query.toLowerCase().trim();
        return posts.filter(post => 
            (post.title && post.title.toLowerCase().includes(searchTerm)) ||
            (post.content && post.content.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * 按筛选条件获取公告
     */
    getPostsByFilter(filter) {
        const posts = this.getPosts();
        
        switch (filter) {
            case 'today':
                return posts.filter(post => Utils.Date.isToday(post.createdAt));
            
            case 'with-images':
                return posts.filter(post => post.images && post.images.length > 0);
            
            case 'all':
            default:
                return posts;
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const posts = this.getPosts();
        const today = new Date();
        
        const todayPosts = posts.filter(post => Utils.Date.isToday(post.createdAt));
        
        return {
            totalPosts: posts.length,
            todayPosts: todayPosts.length,
            postsWithImages: posts.filter(post => post.images && post.images.length > 0).length,
            lastPostDate: posts.length > 0 ? posts[0].createdAt : null
        };
    }

    /**
     * 获取设置
     */
    getSettings() {
        const data = this.getAllData();
        return data && data.settings ? data.settings : {
            theme: 'light',
            autoSave: true,
            notifications: true
        };
    }

    /**
     * 保存设置
     */
    saveSetting(key, value) {
        const data = this.getAllData() || { settings: {} };
        if (!data.settings) data.settings = {};
        
        data.settings[key] = value;
        return this.saveAllData(data);
    }

    /**
     * 导出数据
     */
    exportData() {
        const data = this.getAllData();
        if (!data) return null;

        // 创建导出对象
        const exportData = {
            ...data,
            exportDate: new Date().toISOString(),
            appVersion: this.VERSION
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 导入数据
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // 验证数据格式
            if (!data.posts || !Array.isArray(data.posts)) {
                throw new Error('无效的数据格式');
            }

            // 处理导入的公告数据
            const posts = data.posts.map(post => ({
                ...post,
                id: post.id || Utils.String.generateId(),
                createdAt: new Date(post.createdAt || Date.now()),
                updatedAt: post.updatedAt ? new Date(post.updatedAt) : null
            }));

            // 合并现有数据和导入数据
            const currentData = this.getAllData() || { posts: [], settings: {}, stats: {} };
            const mergedPosts = [...posts, ...currentData.posts];
            
            // 去重（基于ID）
            const uniquePosts = mergedPosts.filter((post, index, arr) => 
                arr.findIndex(p => p.id === post.id) === index
            );

            // 按创建时间排序
            uniquePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const newData = {
                ...currentData,
                posts: uniquePosts,
                stats: {
                    ...currentData.stats,
                    totalPosts: uniquePosts.length
                }
            };

            return this.saveAllData(newData);
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            this.resetStorage();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        if (!Utils.Browser.supports('localStorage')) {
            return { supported: false };
        }

        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const dataSize = data ? new Blob([data]).size : 0;
            const totalQuota = 5 * 1024 * 1024; // 假设5MB配额

            return {
                supported: true,
                used: dataSize,
                total: totalQuota,
                percentage: Math.round((dataSize / totalQuota) * 100),
                remaining: totalQuota - dataSize
            };
        } catch (error) {
            return { supported: true, error: error.message };
        }
    }
}

// 创建全局存储实例
window.AppStorage = new Storage(); 