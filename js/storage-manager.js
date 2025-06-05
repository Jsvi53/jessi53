/**
 * 存储模式管理器
 * 自动判断存储模式：优先使用数据库，不可用时自动回退到本地存储
 */

class StorageManager {
    constructor() {
        this.isApiMode = false;
        this.storage = null;
        this.isInitialized = false;
        this.isInitializing = false;
        this.init();
    }

    async init() {
        if (this.isInitializing) return;
        this.isInitializing = true;
        
        console.log('🔄 初始化存储管理器...');
        
        try {
            // 默认尝试使用数据库存储
            const success = await this.tryDatabaseStorage();
            
            if (!success) {
                // 如果数据库不可用，使用本地存储
                this.useLocalStorage();
            }

            // 设置全局存储引用
            window.CurrentStorage = this.storage;
            this.isInitialized = true;
            this.isInitializing = false;

            console.log(`✅ 存储管理器初始化完成，当前模式：${this.isApiMode ? 'API数据库' : '本地存储'}`);
            
        } catch (error) {
            console.error('❌ 存储管理器初始化失败:', error);
            
            // 尝试回退到最基础的本地存储
            try {
                this.useLocalStorage();
                window.CurrentStorage = this.storage;
                this.isInitialized = true;
                console.log('🔄 已回退到本地存储模式');
            } catch (fallbackError) {
                console.error('❌ 本地存储也初始化失败:', fallbackError);
                // 即使存储完全失败，也要设置标志避免无限等待
                this.isInitialized = true;
            }
            
            this.isInitializing = false;
        }
    }

    async tryDatabaseStorage() {
        try {
            console.log('🔍 尝试连接数据库...');
            
            // 检查API服务是否可用
            const response = await fetch('/api/health', {
                method: 'GET',
                timeout: 5000 // 5秒超时
            });

            if (!response.ok) {
                throw new Error(`API服务响应异常: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error('API健康检查失败');
            }

            // 测试数据库操作
            await window.ApiStorage.checkApiConnection();

            // 成功连接数据库
            this.isApiMode = true;
            this.storage = window.ApiStorage;
            
            console.log('✅ 数据库连接成功，使用数据库存储');
            
            return true;

        } catch (error) {
            console.warn('⚠️ 数据库连接失败:', error.message);
            return false;
        }
    }

    useLocalStorage() {
        console.log('📁 使用本地存储模式');
        
        this.isApiMode = false;
        this.storage = window.AppStorage;
    }

    // 检查数据库连接状态
    async checkDatabaseConnection() {
        if (!this.isApiMode) {
            return false;
        }

        try {
            const response = await fetch('/api/health', { 
                method: 'GET',
                timeout: 3000 
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // 自动切换到本地存储（当数据库连接断开时）
    async handleDatabaseError() {
        if (this.isApiMode) {
            console.warn('🔄 数据库连接断开，自动切换到本地存储');
            this.useLocalStorage();
            window.CurrentStorage = this.storage;
            
            // 通知UI更新
            if (window.UI) {
                window.UI.updateStorageReference(this.storage);
                window.UI.updateStats();
                window.UI.renderPosts();
            }
        }
    }

    // 定期检查连接状态
    startConnectionMonitor() {
        if (this.connectionMonitor) {
            return;
        }

        this.connectionMonitor = setInterval(async () => {
            if (this.isApiMode) {
                const isConnected = await this.checkDatabaseConnection();
                if (!isConnected) {
                    await this.handleDatabaseError();
                }
            } else {
                // 如果当前是本地存储，偶尔检查数据库是否恢复
                const canUseDatabase = await this.tryDatabaseStorage();
                if (canUseDatabase) {
                    console.log('📡 数据库已恢复，切换到数据库存储');
                    window.CurrentStorage = this.storage;
                    
                    // 通知UI更新
                    if (window.UI) {
                        window.UI.updateStorageReference(this.storage);
                        window.UI.updateStats();
                        window.UI.renderPosts();
                    }
                }
            }
        }, 30000); // 每30秒检查一次
    }

    stopConnectionMonitor() {
        if (this.connectionMonitor) {
            clearInterval(this.connectionMonitor);
            this.connectionMonitor = null;
        }
    }

    // 获取当前存储实例
    getCurrentStorage() {
        return this.storage;
    }

    // 检查是否为API模式
    isApiModeActive() {
        return this.isApiMode;
    }

    // 获取存储模式信息
    getStorageInfo() {
        return {
            mode: this.isApiMode ? 'database' : 'local',
            storage: this.storage,
            isConnected: this.isApiMode,
            isInitialized: this.isInitialized
        };
    }

    // 手动重试数据库连接
    async retryDatabaseConnection() {
        if (this.isApiMode) {
            return true; // 已经在使用数据库
        }

        const success = await this.tryDatabaseStorage();
        if (success) {
            window.CurrentStorage = this.storage;
            
            // 通知UI更新
            if (window.UI) {
                window.UI.updateStorageReference(this.storage);
                window.UI.updateStats();
                window.UI.renderPosts();
            }
        }
        
        return success;
    }
}

// 创建全局存储管理器实例
window.StorageManager = new StorageManager();

// 向后兼容：确保AppStorage始终可用
window.addEventListener('load', () => {
    // 设置默认的当前存储
    if (!window.CurrentStorage && window.StorageManager.isInitialized) {
        window.CurrentStorage = window.StorageManager.getCurrentStorage() || window.AppStorage;
    }

    // 启动连接监控
    window.StorageManager.startConnectionMonitor();
});

// 页面卸载时停止监控
window.addEventListener('beforeunload', () => {
    if (window.StorageManager) {
        window.StorageManager.stopConnectionMonitor();
    }
}); 