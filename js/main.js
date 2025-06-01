/**
 * 公告板主应用程序
 */

class AnnouncementBoard {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.debug = false;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('开始初始化应用...');
            this.showLoadingScreen();
            
            // 检查浏览器兼容性
            console.log('检查浏览器兼容性...');
            this.checkBrowserCompatibility();
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                console.log('等待DOM加载完成...');
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            console.log('DOM已加载完成');
            
            // 初始化各个模块
            console.log('初始化各个模块...');
            await this.initializeModules();
            
            // 设置全局事件监听
            console.log('设置全局事件监听...');
            this.setupGlobalEvents();
            
            // 加载示例数据（如果是首次使用）
            console.log('加载示例数据...');
            this.loadSampleDataIfNeeded();
            
            // 标记为已初始化
            this.isInitialized = true;
            
            // 隐藏加载屏幕
            console.log('隐藏加载屏幕...');
            this.hideLoadingScreen();
            
            console.log(`📢 公告板应用已启动 v${this.version}`);
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorScreen(error);
        }
    }

    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const loader = document.createElement('div');
        loader.id = 'appLoader';
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>正在加载公告板...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        const loader = document.getElementById('appLoader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }
    }

    /**
     * 显示错误屏幕
     */
    showErrorScreen(error) {
        const errorScreen = document.createElement('div');
        errorScreen.className = 'error-screen';
        errorScreen.innerHTML = `
            <div class="error-content">
                <h2>😔 应用启动失败</h2>
                <p>抱歉，公告板无法正常启动</p>
                <details>
                    <summary>错误详情</summary>
                    <pre>${error.message}</pre>
                </details>
                <button onclick="location.reload()">重新加载</button>
            </div>
        `;
        document.body.appendChild(errorScreen);
        this.hideLoadingScreen();
    }

    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'localStorage',
            'fileReader',
            'dragAndDrop'
        ];

        const unsupportedFeatures = requiredFeatures.filter(
            feature => !Utils.Browser.supports(feature)
        );

        if (unsupportedFeatures.length > 0) {
            console.warn('以下功能不受支持:', unsupportedFeatures);
            
            // 显示兼容性警告（非阻断性）
            setTimeout(() => {
                if (window.UI) {
                    UI.showToast(
                        '兼容性提醒', 
                        '您的浏览器可能不支持某些功能，建议使用最新版本的现代浏览器', 
                        'warning'
                    );
                }
            }, 2000);
        }
    }

    /**
     * 初始化各个模块
     */
    async initializeModules() {
        // 所有模块都是自动初始化的，这里只需要确保它们存在
        const modules = ['Utils', 'AppStorage', 'UI'];
        
        for (const moduleName of modules) {
            if (!window[moduleName]) {
                throw new Error(`模块 ${moduleName} 未正确加载`);
            }
        }
        
        // 等待存储管理器初始化完成
        if (window.StorageManager && !window.StorageManager.isInitialized) {
            await new Promise(resolve => {
                const checkInit = () => {
                    if (window.StorageManager.isInitialized) {
                        resolve();
                    } else {
                        setTimeout(checkInit, 50);
                    }
                };
                checkInit();
            });
        }
        
        // 等待UI模块完全初始化
        if (window.UI && !UI.isInitialized) {
            await new Promise(resolve => {
                const checkInit = () => {
                    if (UI.isInitialized) {
                        resolve();
                    } else {
                        setTimeout(checkInit, 50);
                    }
                };
                checkInit();
            });
        }
    }

    /**
     * 设置全局事件监听
     */
    setupGlobalEvents() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // 在线/离线状态
        window.addEventListener('online', () => this.onOnline());
        window.addEventListener('offline', () => this.onOffline());

        // 页面卸载前保存
        window.addEventListener('beforeunload', (e) => this.onBeforeUnload(e));

        // 全局错误处理
        window.addEventListener('error', (e) => this.onGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.onUnhandledRejection(e));

        // 窗口大小变化
        window.addEventListener('resize', Utils.DOM.throttle(() => {
            this.onWindowResize();
        }, 250));
    }

    /**
     * 页面隐藏时的处理
     */
    onPageHidden() {
        // 自动保存草稿等
        console.log('页面隐藏，执行自动保存');
    }

    /**
     * 页面可见时的处理
     */
    onPageVisible() {
        // 刷新数据等
        console.log('页面重新可见');
        if (UI) {
            UI.updateStats();
        }
    }

    /**
     * 网络连接恢复
     */
    onOnline() {
        if (UI) {
            UI.showToast('网络已连接', '您已重新连接到网络', 'success');
        }
    }

    /**
     * 网络连接断开
     */
    onOffline() {
        if (UI) {
            UI.showToast('网络已断开', '您当前处于离线状态，数据将保存在本地', 'warning');
        }
    }

    /**
     * 页面卸载前处理
     */
    onBeforeUnload(e) {
        // 检查是否有未保存的内容
        if (UI && UI.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '您有未保存的更改，确定要离开吗？';
            return e.returnValue;
        }
    }

    /**
     * 全局错误处理
     */
    onGlobalError(e) {
        console.error('全局错误:', e.error);
        
        if (UI) {
            UI.showToast('系统错误', '发生了一个错误，但应用仍在运行', 'error');
        }
    }

    /**
     * 未处理的 Promise 拒绝
     */
    onUnhandledRejection(e) {
        console.error('未处理的 Promise 拒绝:', e.reason);
        e.preventDefault();
    }

    /**
     * 窗口大小变化处理
     */
    onWindowResize() {
        // 可以在这里处理响应式布局调整
        console.log('窗口大小已改变');
    }

    /**
     * 加载示例数据（首次使用）
     */
    loadSampleDataIfNeeded() {
        const currentStorage = window.CurrentStorage || window.AppStorage;
        const stats = currentStorage.getStats();
        
        if (stats.totalPosts === 0) {
            // 添加一些示例公告
            const samplePosts = [
                {
                    title: '欢迎使用公告板！',
                    content: '这是你的第一条公告！你可以在这里发布文字、图片，记录生活中的点点滴滴。\n\n点击右上角的"发布新公告"按钮开始创建你的内容吧！',
                    images: []
                },
                {
                    title: '',
                    content: '💡 小贴士：\n• 支持拖拽上传图片\n• 可以使用搜索功能快速找到内容\n• 支持明亮/暗色主题切换\n• 所有数据都保存在本地，隐私安全',
                    images: []
                }
            ];

            samplePosts.forEach(post => {
                currentStorage.savePost(post);
            });

            if (UI) {
                UI.updateStats();
                UI.renderPosts();
                
                setTimeout(() => {
                    UI.showToast(
                        '欢迎使用！', 
                        '我们为你添加了一些示例内容，快来探索吧！', 
                        'success'
                    );
                }, 1000);
            }
        }
    }

    /**
     * 导出应用数据
     */
    exportData() {
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            const data = currentStorage.exportData();
            if (!data) {
                throw new Error('没有可导出的数据');
            }

            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `announcement_board_backup_${Utils.Date.formatDate(new Date())}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            if (UI) {
                UI.showToast('导出成功', '数据已保存到下载文件夹', 'success');
            }
        } catch (error) {
            console.error('导出失败:', error);
            if (UI) {
                UI.showToast('导出失败', error.message, 'error');
            }
        }
    }

    /**
     * 导入应用数据
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const currentStorage = window.CurrentStorage || window.AppStorage;
                const success = await currentStorage.importData(text);
                
                if (success) {
                    UI.updateStats();
                    UI.renderPosts();
                    UI.showToast('导入成功', '数据已成功导入', 'success');
                } else {
                    throw new Error('导入失败，请检查文件格式');
                }
            } catch (error) {
                console.error('导入失败:', error);
                UI.showToast('导入失败', error.message, 'error');
            }
        };
        
        input.click();
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作无法撤销。')) {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            currentStorage.clearAllData();
            UI.updateStats();
            UI.renderPosts();
            UI.showToast('数据已清空', '所有公告已被删除', 'success');
        }
    }

    /**
     * 获取应用信息
     */
    getAppInfo() {
        const currentStorage = window.CurrentStorage || window.AppStorage;
        const stats = currentStorage.getStats();
        const storageInfo = currentStorage.getStorageInfo();
        const deviceInfo = Utils.Browser.getDeviceInfo();
        
        return {
            version: this.version,
            stats,
            storage: storageInfo,
            device: deviceInfo,
            buildTime: new Date().toISOString()
        };
    }

    /**
     * 切换调试模式
     */
    toggleDebugMode() {
        this.debug = !this.debug;
        console.log(`调试模式: ${this.debug ? '开启' : '关闭'}`);
        
        if (this.debug) {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            // 在调试模式下暴露一些有用的全局函数
            window.DEBUG = {
                app: this,
                exportData: () => this.exportData(),
                importData: () => this.importData(),
                clearData: () => this.clearAllData(),
                getInfo: () => this.getAppInfo(),
                storage: currentStorage,
                ui: UI,
                utils: Utils
            };
            
            console.log('调试工具已暴露到 window.DEBUG');
        } else {
            delete window.DEBUG;
        }
    }

    /**
     * 应用健康检查
     */
    healthCheck() {
        const currentStorage = window.CurrentStorage || window.AppStorage;
        
        const checks = [
            {
                name: '存储功能',
                test: () => Utils.Browser.supports('localStorage'),
                fix: '请使用支持 localStorage 的现代浏览器'
            },
            {
                name: '文件读取',
                test: () => Utils.Browser.supports('fileReader'),
                fix: '请升级浏览器以支持文件上传功能'
            },
            {
                name: '数据完整性',
                test: () => {
                    try {
                        if (currentStorage.getAllData) {
                            const data = currentStorage.getAllData();
                            return data && typeof data === 'object';
                        }
                        return true; // API模式下跳过此检查
                    } catch {
                        return false;
                    }
                },
                fix: '尝试清除浏览器数据并重新加载页面'
            }
        ];

        const results = checks.map(check => ({
            name: check.name,
            passed: check.test(),
            fix: check.fix
        }));

        const failed = results.filter(r => !r.passed);
        
        if (failed.length === 0) {
            console.log('✅ 所有健康检查通过');
            return { healthy: true, results };
        } else {
            console.warn('⚠️  发现问题:', failed);
            return { healthy: false, results, issues: failed };
        }
    }
}

// 启动应用
const app = new AnnouncementBoard();

// 暴露到全局（用于控制台调试）
window.App = app;

// 开发模式下的快捷键
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+D 开启调试模式
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            app.toggleDebugMode();
        }
        
        // Ctrl+Shift+H 健康检查
        if (e.ctrlKey && e.shiftKey && e.key === 'H') {
            console.log('健康检查结果:', app.healthCheck());
        }
    });
} 