/**
 * 公告板用户界面管理
 */

class UIManager {
    constructor() {
        this.elements = {};
        this.currentFilter = 'all';
        this.currentSearchQuery = '';
        this.selectedImages = [];
        this.currentImageIndex = 0;
        this.viewerImages = [];
        this.isInitialized = false;
        
        // 延迟初始化，等待DOM和存储准备好
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * 初始化UI
     */
    init() {
        try {
            this.cacheElements();
            this.bindEvents();
            this.initRichEditor();
            
            // 延迟初始化需要存储的功能
            this.waitForStorageAndInit();
            
            this.isInitialized = true;
            console.log('✅ UI管理器初始化完成');
        } catch (error) {
            console.error('❌ UI初始化失败:', error);
            throw error;
        }
    }

    /**
     * 等待存储准备好后初始化相关功能
     */
    async waitForStorageAndInit() {
        // 等待存储管理器准备好
        let retries = 0;
        const maxRetries = 50; // 最多等待5秒
        
        while (retries < maxRetries) {
            if (window.CurrentStorage || window.AppStorage) {
                // 存储已准备好，初始化依赖存储的功能
                this.initTheme();
                this.renderInitialContent();
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        // 如果等待超时，使用默认设置
        console.warn('⚠️ 存储初始化超时，使用默认设置');
        this.setTheme('light'); // 使用默认主题
        this.renderInitialContent();
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        this.elements = {
            // 导航元素
            themeToggle: document.getElementById('themeToggle'),
            newPostBtn: document.getElementById('newPostBtn'),
            
            // 搜索和筛选
            searchInput: document.getElementById('searchInput'),
            filterTabs: document.querySelectorAll('.filter-tab'),
            
            // 统计数据
            totalPosts: document.getElementById('totalPosts'),
            todayPosts: document.getElementById('todayPosts'),
            
            // 公告容器
            postsContainer: document.getElementById('postsContainer'),
            emptyState: document.getElementById('emptyState'),
            
            // 模态框
            postModal: document.getElementById('postModal'),
            closeModal: document.getElementById('closeModal'),
            deleteModal: document.getElementById('deleteModal'),
            
            // 表单元素
            postForm: document.getElementById('postForm'),
            postTitle: document.getElementById('postTitle'),
            postContent: document.getElementById('postContent'),
            postImages: document.getElementById('postImages'),
            charCount: document.getElementById('charCount'),
            imageUpload: document.getElementById('imageUpload'),
            imagePreview: document.getElementById('imagePreview'),
            cancelBtn: document.getElementById('cancelBtn'),
            
            // 删除确认
            cancelDelete: document.getElementById('cancelDelete'),
            confirmDelete: document.getElementById('confirmDelete'),
            
            // 图片查看器
            imageViewer: document.getElementById('imageViewer'),
            viewerClose: document.getElementById('viewerClose'),
            viewerImage: document.getElementById('viewerImage'),
            prevImage: document.getElementById('prevImage'),
            nextImage: document.getElementById('nextImage'),
            
            // Toast容器
            toastContainer: document.getElementById('toastContainer')
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 主题切换
        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // 新建公告
        this.elements.newPostBtn?.addEventListener('click', () => this.openPostModal());
        
        // 搜索功能
        this.elements.searchInput?.addEventListener('input', Utils.DOM.debounce((e) => {
            this.currentSearchQuery = e.target.value;
            this.renderPosts();
        }, 300));
        
        // 筛选切换
        this.elements.filterTabs?.forEach(tab => {
            tab.addEventListener('click', () => this.switchFilter(tab.dataset.filter));
        });
        
        // 模态框控制
        this.elements.closeModal?.addEventListener('click', () => this.closePostModal());
        this.elements.cancelBtn?.addEventListener('click', () => this.closePostModal());
        this.elements.postModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.postModal) this.closePostModal();
        });
        
        // 表单提交
        this.elements.postForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // 字符计数 - 改为监听富文本编辑器
        this.elements.postContent?.addEventListener('input', () => this.updateCharCount());
        this.elements.postContent?.addEventListener('keyup', () => this.updateCharCount());
        this.elements.postContent?.addEventListener('paste', () => {
            setTimeout(() => this.updateCharCount(), 10);
        });
        
        // 图片上传
        this.elements.imageUpload?.addEventListener('click', () => this.elements.postImages?.click());
        this.elements.postImages?.addEventListener('change', (e) => this.handleImageSelect(e));
        
        // 拖拽上传
        this.setupDragAndDrop();
        
        // 删除确认
        this.elements.cancelDelete?.addEventListener('click', () => this.closeDeleteModal());
        this.elements.confirmDelete?.addEventListener('click', () => this.confirmDeletePost());
        this.elements.deleteModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteModal) this.closeDeleteModal();
        });
        
        // 图片查看器
        this.elements.viewerClose?.addEventListener('click', () => this.closeImageViewer());
        this.elements.prevImage?.addEventListener('click', () => this.showPrevImage());
        this.elements.nextImage?.addEventListener('click', () => this.showNextImage());
        this.elements.imageViewer?.addEventListener('click', (e) => {
            if (e.target === this.elements.imageViewer) this.closeImageViewer();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * 初始化主题
     */
    initTheme() {
        const currentStorage = window.CurrentStorage || window.AppStorage;
        const savedTheme = currentStorage.getSettings().theme;
        this.setTheme(savedTheme);
    }

    /**
     * 初始化富文本编辑器
     */
    initRichEditor() {
        // 工具栏按钮事件
        document.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                this.executeEditorCommand(command);
                this.updateCharCount();
            });
        });

        // 字体选择
        const fontFamily = document.getElementById('fontFamily');
        const fontSize = document.getElementById('fontSize');
        
        fontFamily?.addEventListener('change', (e) => {
            this.executeEditorCommand('fontName', e.target.value);
        });
        
        fontSize?.addEventListener('change', (e) => {
            this.executeEditorCommand('fontSize', '3'); // HTML fontSize 使用1-7
            if (this.elements.postContent) {
                // 使用CSS方式设置字体大小
                document.execCommand('fontSize', false, '3');
                const fontElements = this.elements.postContent.querySelectorAll('font[size="3"]');
                fontElements.forEach(el => {
                    el.removeAttribute('size');
                    el.style.fontSize = e.target.value;
                });
            }
        });

        // 颜色选择
        const textColor = document.getElementById('textColor');
        const backgroundColor = document.getElementById('backgroundColor');
        
        textColor?.addEventListener('change', (e) => {
            this.executeEditorCommand('foreColor', e.target.value);
        });
        
        backgroundColor?.addEventListener('change', (e) => {
            this.executeEditorCommand('backColor', e.target.value);
        });

        // 间距控制
        const lineSpacingBtn = document.getElementById('lineSpacingBtn');
        const paragraphSpacingBtn = document.getElementById('paragraphSpacingBtn');
        const spacingPanel = document.getElementById('spacingPanel');
        
        lineSpacingBtn?.addEventListener('click', () => {
            spacingPanel.style.display = spacingPanel.style.display === 'none' ? 'block' : 'none';
        });

        // 行间距控制
        const lineHeight = document.getElementById('lineHeight');
        const lineHeightValue = document.getElementById('lineHeightValue');
        
        lineHeight?.addEventListener('input', (e) => {
            const value = e.target.value;
            lineHeightValue.textContent = value;
            if (this.elements.postContent) {
                this.elements.postContent.style.lineHeight = value;
            }
        });

        // 段落间距控制
        const paragraphSpacing = document.getElementById('paragraphSpacing');
        const paragraphSpacingValue = document.getElementById('paragraphSpacingValue');
        
        paragraphSpacing?.addEventListener('input', (e) => {
            const value = e.target.value;
            paragraphSpacingValue.textContent = value + 'em';
            if (this.elements.postContent) {
                this.elements.postContent.style.setProperty('--paragraph-spacing', value + 'em');
            }
        });
    }

    /**
     * 执行编辑器命令
     */
    executeEditorCommand(command, value = null) {
        this.elements.postContent?.focus();
        document.execCommand(command, false, value);
        
        // 更新工具栏按钮状态
        this.updateToolbarState();
    }

    /**
     * 更新工具栏按钮状态
     */
    updateToolbarState() {
        const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
        
        commands.forEach(command => {
            const btn = document.querySelector(`[data-command="${command}"]`);
            if (btn) {
                const isActive = document.queryCommandState(command);
                btn.classList.toggle('active', isActive);
            }
        });
    }

    /**
     * 渲染初始内容
     */
    renderInitialContent() {
        // 安全检查存储是否可用
        if (window.CurrentStorage || window.AppStorage) {
            this.updateStats();
            this.renderPosts();
        } else {
            // 显示空状态
            this.displayPosts([]);
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * 设置主题
     */
    setTheme(theme = 'light') {
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // 保存主题设置
        const currentStorage = window.CurrentStorage || window.AppStorage;
        const settings = currentStorage.getSettings();
        settings.theme = theme;
        currentStorage.saveSettings(settings);
    }

    /**
     * 切换筛选
     */
    switchFilter(filter) {
        this.currentFilter = filter;
        
        // 更新活动状态
        this.elements.filterTabs?.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        this.renderPosts();
    }

    /**
     * 更新统计数据
     */
    async updateStats() {
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            if (!currentStorage) {
                // 如果存储不可用，显示默认值
                if (this.elements.totalPosts) {
                    this.elements.totalPosts.textContent = '0';
                }
                if (this.elements.todayPosts) {
                    this.elements.todayPosts.textContent = '0';
                }
                return;
            }

            const stats = await currentStorage.getStats();
            
            if (this.elements.totalPosts) {
                this.elements.totalPosts.textContent = stats.totalPosts || 0;
            }
            
            if (this.elements.todayPosts) {
                this.elements.todayPosts.textContent = stats.todayPosts || 0;
            }
        } catch (error) {
            console.error('更新统计信息失败:', error);
            // 显示默认值
            if (this.elements.totalPosts) {
                this.elements.totalPosts.textContent = '0';
            }
            if (this.elements.todayPosts) {
                this.elements.todayPosts.textContent = '0';
            }
        }
    }

    /**
     * 渲染公告列表
     */
    async renderPosts() {
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            if (!currentStorage) {
                // 如果存储不可用，显示空列表
                this.displayPosts([]);
                return;
            }

            const posts = await currentStorage.getPosts();
            this.displayPosts(posts);
        } catch (error) {
            console.error('渲染公告失败:', error);
            this.displayPosts([]);
        }
    }

    /**
     * 创建公告元素
     */
    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.dataset.postId = post.id;
        
        const header = document.createElement('div');
        header.className = 'post-header';
        
        if (post.title) {
            const title = document.createElement('h3');
            title.className = 'post-title';
            title.textContent = post.title;
            header.appendChild(title);
        }
        
        const actions = document.createElement('div');
        actions.className = 'post-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '<i class="fas fa-edit" title="编辑"></i>';
        editBtn.addEventListener('click', () => this.editPost(post.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash" title="删除"></i>';
        deleteBtn.addEventListener('click', () => this.deletePost(post.id));
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        header.appendChild(actions);
        
        const content = document.createElement('div');
        content.className = 'post-content rich-content';
        
        // 直接使用HTML内容，不转义
        if (this.currentSearchQuery) {
            // 如果有搜索查询，先获取纯文本进行高亮，然后设置HTML
            const textContent = this.getTextFromHTML(post.content);
            const highlightedText = Utils.String.highlightText(textContent, this.currentSearchQuery);
            content.innerHTML = highlightedText;
        } else {
            // 直接显示富文本HTML内容
            content.innerHTML = post.content;
        }
        
        article.appendChild(header);
        article.appendChild(content);
        
        // 添加图片
        if (post.images && post.images.length > 0) {
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'post-images';
            
            post.images.forEach((imageSrc, index) => {
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'post-image';
                
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = `图片 ${index + 1}`;
                img.addEventListener('click', () => this.openImageViewer(post.images, index));
                
                imageWrapper.appendChild(img);
                imagesContainer.appendChild(imageWrapper);
            });
            
            article.appendChild(imagesContainer);
        }
        
        // 添加元信息
        const meta = document.createElement('div');
        meta.className = 'post-meta';
        
        const time = document.createElement('div');
        time.className = 'post-time';
        time.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>${Utils.Date.formatRelativeTime(post.createdAt)}</span>
        `;
        
        meta.appendChild(time);
        article.appendChild(meta);
        
        return article;
    }

    /**
     * 从HTML中提取纯文本
     */
    getTextFromHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * 显示公告列表
     */
    displayPosts(posts) {
        const container = this.elements.postsContainer;
        const emptyState = this.elements.emptyState;
        
        if (!container) {
            console.warn('公告容器未找到');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        if (!posts || posts.length === 0) {
            // 显示空状态
            container.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        // 隐藏空状态
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        container.style.display = 'grid';

        // 过滤公告
        const filteredPosts = this.filterPostsByQuery(posts);

        // 渲染公告
        filteredPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });

        // 如果过滤后没有结果，显示相应提示
        if (filteredPosts.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <h3>没有找到相关公告</h3>
                <p>尝试更换搜索关键词或筛选条件</p>
            `;
            container.appendChild(noResults);
        }
    }

    /**
     * 根据搜索和筛选条件过滤公告
     */
    filterPostsByQuery(posts) {
        if (!posts || posts.length === 0) return [];

        let filtered = [...posts];

        // 按筛选条件过滤
        if (this.currentFilter && this.currentFilter !== 'all') {
            filtered = filtered.filter(post => {
                switch (this.currentFilter) {
                    case 'today':
                        const today = new Date().toDateString();
                        const postDate = new Date(post.createdAt).toDateString();
                        return today === postDate;
                    case 'with-images':
                        return post.images && post.images.length > 0;
                    default:
                        return true;
                }
            });
        }

        // 按搜索查询过滤
        if (this.currentSearchQuery && this.currentSearchQuery.trim()) {
            const query = this.currentSearchQuery.toLowerCase().trim();
            filtered = filtered.filter(post => {
                const title = (post.title || '').toLowerCase();
                const content = this.getTextFromHTML(post.content || '').toLowerCase();
                return title.includes(query) || content.includes(query);
            });
        }

        // 按创建时间排序（最新的在前）
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return filtered;
    }

    /**
     * 打开发布模态框
     */
    openPostModal(postId = null) {
        this.currentEditingPost = postId;
        this.selectedImages = [];
        
        // 重置表单
        if (this.elements.postTitle) this.elements.postTitle.value = '';
        if (this.elements.postContent) {
            this.elements.postContent.innerHTML = '';
            this.elements.postContent.style.lineHeight = '1.6';
            this.elements.postContent.style.setProperty('--paragraph-spacing', '1em');
        }
        
        // 重置间距控制
        const lineHeight = document.getElementById('lineHeight');
        const paragraphSpacing = document.getElementById('paragraphSpacing');
        const lineHeightValue = document.getElementById('lineHeightValue');
        const paragraphSpacingValue = document.getElementById('paragraphSpacingValue');
        
        if (lineHeight) lineHeight.value = '1.6';
        if (paragraphSpacing) paragraphSpacing.value = '1';
        if (lineHeightValue) lineHeightValue.textContent = '1.6';
        if (paragraphSpacingValue) paragraphSpacingValue.textContent = '1em';
        
        this.renderImagePreview();
        
        // 如果是编辑模式，加载现有数据
        if (postId) {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            if (currentStorage && currentStorage.getPostById) {
                const post = currentStorage.getPostById(postId);
                if (post) {
                    if (this.elements.postTitle) this.elements.postTitle.value = post.title || '';
                    if (this.elements.postContent) this.elements.postContent.innerHTML = post.content || '';
                    this.selectedImages = post.images || [];
                    this.renderImagePreview();
                }
            }
        }
        
        Utils.DOM.show(this.elements.postModal);
        this.elements.postContent?.focus();
        this.updateCharCount();
    }

    /**
     * 关闭发布模态框
     */
    closePostModal() {
        Utils.DOM.hide(this.elements.postModal);
        this.currentEditingPost = null;
        this.selectedImages = [];
        
        // 隐藏间距面板
        const spacingPanel = document.getElementById('spacingPanel');
        if (spacingPanel) spacingPanel.style.display = 'none';
    }

    /**
     * 处理表单提交
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const title = this.elements.postTitle?.value?.trim();
        const content = this.elements.postContent?.innerHTML?.trim();
        
        if (!content) {
            this.showToast('错误', '请输入公告内容', 'error');
            return;
        }
        
        const post = {
            title: title || null,
            content,
            images: this.selectedImages
        };
        
        // 如果是编辑模式，保留ID
        if (this.currentEditingPost) {
            post.id = this.currentEditingPost;
        }
        
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            const savedPost = await currentStorage.savePost(post);
            
            if (savedPost) {
                this.showToast('成功', '公告发布成功', 'success');
                this.closePostModal();
                await this.updateStats();
                await this.renderPosts();
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            console.error('保存公告失败:', error);
            this.showToast('错误', '发布失败，请重试', 'error');
        }
    }

    /**
     * 编辑公告
     */
    editPost(postId) {
        this.openPostModal(postId);
    }

    /**
     * 删除公告
     */
    deletePost(postId) {
        this.postToDelete = postId;
        Utils.DOM.show(this.elements.deleteModal);
    }

    /**
     * 确认删除公告
     */
    async confirmDeletePost() {
        if (!this.postToDelete) return;
        
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            const success = await currentStorage.deletePost(this.postToDelete);
            
            if (success) {
                this.showToast('成功', '公告已删除', 'success');
                await this.updateStats();
                await this.renderPosts();
            } else {
                throw new Error('删除失败');
            }
        } catch (error) {
            console.error('删除公告失败:', error);
            this.showToast('错误', '删除失败，请重试', 'error');
        }
        
        this.closeDeleteModal();
    }

    /**
     * 关闭删除模态框
     */
    closeDeleteModal() {
        Utils.DOM.hide(this.elements.deleteModal);
        this.postToDelete = null;
    }

    /**
     * 更新字符计数
     */
    updateCharCount() {
        const content = this.elements.postContent?.textContent || '';
        const count = content.length;
        const maxLength = 1000;
        
        if (this.elements.charCount) {
            this.elements.charCount.textContent = count;
            this.elements.charCount.style.color = count > maxLength ? 'var(--danger-color)' : '';
        }
    }

    /**
     * 处理图片选择
     */
    async handleImageSelect(e) {
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            const validation = Utils.File.isValidImage(file);
            if (!validation.valid) {
                this.showToast('错误', validation.error, 'error');
                continue;
            }
            
            try {
                const dataUrl = await Utils.File.readFileAsDataURL(file);
                this.selectedImages.push(dataUrl);
            } catch (error) {
                this.showToast('错误', '图片上传失败', 'error');
            }
        }
        
        this.renderImagePreview();
        e.target.value = ''; // 清空文件输入
    }

    /**
     * 设置拖拽上传
     */
    setupDragAndDrop() {
        const uploadArea = this.elements.imageUpload;
        if (!uploadArea) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
        });
        
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    /**
     * 阻止默认事件
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * 处理拖拽放置
     */
    async handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        
        // 模拟文件输入事件
        const event = { target: { files } };
        await this.handleImageSelect(event);
    }

    /**
     * 渲染图片预览
     */
    renderImagePreview() {
        const container = this.elements.imagePreview;
        if (!container) return;
        
        container.innerHTML = '';
        
        this.selectedImages.forEach((imageSrc, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `预览图片 ${index + 1}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'preview-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => this.removeImage(index));
            
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        });
    }

    /**
     * 移除图片
     */
    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.renderImagePreview();
    }

    /**
     * 打开图片查看器
     */
    openImageViewer(images, startIndex = 0) {
        this.viewerImages = images;
        this.currentImageIndex = startIndex;
        this.updateImageViewer();
        Utils.DOM.show(this.elements.imageViewer);
    }

    /**
     * 关闭图片查看器
     */
    closeImageViewer() {
        Utils.DOM.hide(this.elements.imageViewer);
        this.viewerImages = [];
        this.currentImageIndex = 0;
    }

    /**
     * 更新图片查看器
     */
    updateImageViewer() {
        if (!this.viewerImages.length) return;
        
        const img = this.elements.viewerImage;
        if (img) {
            img.src = this.viewerImages[this.currentImageIndex];
        }
        
        // 更新按钮状态
        if (this.elements.prevImage) {
            this.elements.prevImage.disabled = this.currentImageIndex === 0;
        }
        
        if (this.elements.nextImage) {
            this.elements.nextImage.disabled = this.currentImageIndex === this.viewerImages.length - 1;
        }
    }

    /**
     * 显示上一张图片
     */
    showPrevImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateImageViewer();
        }
    }

    /**
     * 显示下一张图片
     */
    showNextImage() {
        if (this.currentImageIndex < this.viewerImages.length - 1) {
            this.currentImageIndex++;
            this.updateImageViewer();
        }
    }

    /**
     * 显示Toast通知
     */
    showToast(title, message, type = 'info') {
        const container = this.elements.toastContainer;
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        // 显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboard(e) {
        // ESC 键关闭模态框
        if (e.key === 'Escape') {
            if (this.elements.imageViewer?.classList.contains('active')) {
                this.closeImageViewer();
            } else if (this.elements.postModal?.classList.contains('active')) {
                this.closePostModal();
            } else if (this.elements.deleteModal?.classList.contains('active')) {
                this.closeDeleteModal();
            }
        }
        
        // Ctrl/Cmd + N 新建公告
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openPostModal();
        }
        
        // 图片查看器导航
        if (this.elements.imageViewer?.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                this.showPrevImage();
            } else if (e.key === 'ArrowRight') {
                this.showNextImage();
            }
        }
    }

    /**
     * 更新存储引用（用于存储模式切换）
     */
    updateStorageReference(storage) {
        // 存储引用通过全局变量管理，这里可以添加额外的处理逻辑
        console.log('UI管理器已更新存储引用');
    }

    /**
     * 搜索公告
     */
    async searchPosts() {
        const query = this.elements.searchInput?.value?.trim();
        
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            
            if (query) {
                const results = await currentStorage.searchPosts(query);
                this.displayPosts(results);
                this.highlightSearchResults(query);
            } else {
                await this.renderPosts();
            }
        } catch (error) {
            console.error('搜索失败:', error);
            this.displayPosts([]);
        }
    }

    /**
     * 筛选公告
     */
    async filterPosts(filter) {
        try {
            const currentStorage = window.CurrentStorage || window.AppStorage;
            const posts = await currentStorage.getPostsByFilter(filter);
            this.displayPosts(posts);
        } catch (error) {
            console.error('筛选失败:', error);
            this.displayPosts([]);
        }
    }
}

// 创建全局UI管理实例
window.UI = new UIManager(); 