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
        
        this.init();
    }

    /**
     * 初始化UI
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initTheme();
        this.renderInitialContent();
        this.isInitialized = true;
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
        
        // 字符计数
        this.elements.postContent?.addEventListener('input', () => this.updateCharCount());
        
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
        const savedTheme = AppStorage.getSettings().theme;
        this.setTheme(savedTheme);
    }

    /**
     * 渲染初始内容
     */
    renderInitialContent() {
        this.updateStats();
        this.renderPosts();
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        AppStorage.saveSetting('theme', newTheme);
        this.showToast('主题已切换', `已切换到${newTheme === 'light' ? '明亮' : '暗色'}模式`, 'success');
    }

    /**
     * 设置主题
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
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
    updateStats() {
        const stats = AppStorage.getStats();
        
        if (this.elements.totalPosts) {
            this.elements.totalPosts.textContent = stats.totalPosts;
        }
        
        if (this.elements.todayPosts) {
            this.elements.todayPosts.textContent = stats.todayPosts;
        }
    }

    /**
     * 渲染公告列表
     */
    renderPosts() {
        let posts = [];
        
        // 根据搜索和筛选获取公告
        if (this.currentSearchQuery) {
            posts = AppStorage.searchPosts(this.currentSearchQuery);
        } else {
            posts = AppStorage.getPostsByFilter(this.currentFilter);
        }
        
        const container = this.elements.postsContainer;
        const emptyState = this.elements.emptyState;
        
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        if (posts.length === 0) {
            emptyState?.classList.remove('hidden');
            return;
        }
        
        emptyState?.classList.add('hidden');
        
        // 渲染公告卡片
        posts.forEach((post, index) => {
            const postElement = this.createPostElement(post);
            postElement.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(postElement);
        });
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
        content.className = 'post-content';
        
        // 高亮搜索文本
        const highlightedContent = this.currentSearchQuery 
            ? Utils.String.highlightText(post.content, this.currentSearchQuery)
            : Utils.String.escapeHtml(post.content);
        content.innerHTML = highlightedContent;
        
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
     * 打开发布模态框
     */
    openPostModal(postId = null) {
        this.currentEditingPost = postId;
        this.selectedImages = [];
        
        // 重置表单
        this.elements.postForm?.reset();
        this.elements.imagePreview.innerHTML = '';
        this.updateCharCount();
        
        // 如果是编辑模式，填充数据
        if (postId) {
            const post = AppStorage.getPostById(postId);
            if (post) {
                this.elements.postTitle.value = post.title || '';
                this.elements.postContent.value = post.content || '';
                this.selectedImages = [...(post.images || [])];
                this.renderImagePreview();
                this.updateCharCount();
                
                // 更改标题
                const title = this.elements.postModal?.querySelector('h2');
                if (title) {
                    title.innerHTML = '<i class="fas fa-edit"></i> 编辑公告';
                }
            }
        } else {
            // 新建模式
            const title = this.elements.postModal?.querySelector('h2');
            if (title) {
                title.innerHTML = '<i class="fas fa-edit"></i> 发布新公告';
            }
        }
        
        Utils.DOM.show(this.elements.postModal);
        this.elements.postContent?.focus();
    }

    /**
     * 关闭发布模态框
     */
    closePostModal() {
        Utils.DOM.hide(this.elements.postModal);
        this.currentEditingPost = null;
        this.selectedImages = [];
    }

    /**
     * 处理表单提交
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const title = this.elements.postTitle?.value.trim();
        const content = this.elements.postContent?.value.trim();
        
        // 验证内容
        if (!content) {
            this.showToast('错误', '公告内容不能为空', 'error');
            this.elements.postContent?.focus();
            return;
        }
        
        const post = {
            title: title || null,
            content: content,
            images: [...this.selectedImages]
        };
        
        // 如果是编辑模式，添加ID
        if (this.currentEditingPost) {
            post.id = this.currentEditingPost;
        }
        
        const savedPost = AppStorage.savePost(post);
        
        if (savedPost) {
            this.showToast(
                '成功', 
                this.currentEditingPost ? '公告已更新' : '公告已发布', 
                'success'
            );
            this.closePostModal();
            this.updateStats();
            this.renderPosts();
        } else {
            this.showToast('错误', '保存失败，请重试', 'error');
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
    confirmDeletePost() {
        if (!this.postToDelete) return;
        
        if (AppStorage.deletePost(this.postToDelete)) {
            this.showToast('成功', '公告已删除', 'success');
            this.updateStats();
            this.renderPosts();
        } else {
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
        const content = this.elements.postContent?.value || '';
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
}

// 创建全局UI管理实例
window.UI = new UIManager(); 