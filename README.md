# 📢 创意公告板

一个现代化的在线公告板应用，支持文字、图片发布，具有搜索、筛选、主题切换等功能。

## ✨ 功能特点

- 📝 **内容发布**: 支持文字、图片内容发布
- 🔍 **搜索筛选**: 快速搜索和多种筛选方式
- 🎨 **主题切换**: 明亮/暗色主题自由切换
- 📱 **响应式设计**: 完美适配各种设备
- 💾 **本地存储**: 数据安全保存在本地
- 🖼️ **图片支持**: 拖拽上传，多图展示
- ⌨️ **快捷键**: 便捷的键盘操作
- 🎯 **现代UI**: 简洁美观的用户界面

## 🚀 快速开始

### 方法1: 直接访问

1. 下载项目文件
2. 用浏览器打开 `index.html` 文件

### 方法2: 本地服务器 (推荐)

```bash
# 进入项目目录
cd your-project-folder

# 启动简单HTTP服务器
python -m http.server 8000
# 或者
npx serve .
# 或者
php -S localhost:8000

# 访问 http://localhost:8000
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Custom Properties, Flexbox, Grid
- **存储**: LocalStorage API
- **图标**: Font Awesome
- **字体**: Inter, Noto Sans SC

## 📁 项目结构

```
├── index.html          # 主页面
├── css/
│   ├── style.css       # 主样式文件
│   └── animations.css  # 动画样式
├── js/
│   ├── main.js         # 主应用程序
│   ├── ui.js           # 用户界面管理
│   ├── storage.js      # 数据存储管理
│   └── utils.js        # 工具函数
├── README.md           # 说明文档
└── LICENSE             # 许可证

```

## 🎮 使用指南

### 基本操作

1. **发布公告**: 点击右上角"发布新公告"按钮
2. **搜索内容**: 使用搜索框快速查找
3. **筛选公告**: 使用筛选标签按类型查看
4. **主题切换**: 点击月亮/太阳图标切换主题

### 键盘快捷键

- `Ctrl/Cmd + N`: 新建公告
- `Esc`: 关闭模态框
- `←/→`: 图片查看器中切换图片

### 图片上传

- 支持格式: JPG, PNG, GIF, WebP
- 最大大小: 5MB
- 支持拖拽上传
- 支持多图选择

## 🐛 故障排除

### 页面一直转圈加载

1. **检查浏览器控制台**: 
   - 按 F12 打开开发者工具
   - 查看 Console 标签页的错误信息

2. **清除浏览器缓存**:
   - 按 `Ctrl+Shift+R` 强制刷新
   - 或在设置中清除浏览器数据

3. **检查文件完整性**:
   - 确保所有 CSS 和 JS 文件都存在
   - 检查文件路径是否正确

4. **使用本地服务器**:
   - 避免直接打开 HTML 文件
   - 使用 HTTP 服务器运行

### 数据无法保存

1. 检查浏览器是否支持 LocalStorage
2. 确保没有开启无痕/隐私模式
3. 检查存储空间是否充足

### 图片上传失败

1. 检查图片格式是否支持
2. 确认图片大小不超过 5MB
3. 检查浏览器是否支持 FileReader API

## 🔧 开发调试

### 启用调试模式

在本地环境下，按 `Ctrl+Shift+D` 启用调试模式，可以在控制台使用：

```javascript
// 导出数据
DEBUG.exportData()

// 清除所有数据
DEBUG.clearData()

// 获取应用信息
DEBUG.getInfo()

// 健康检查
DEBUG.app.healthCheck()
```

### 常见问题检查

```javascript
// 检查模块是否正确加载
console.log(window.Utils, window.AppStorage, window.UI)

// 检查UI是否初始化完成
console.log(UI.isInitialized)

// 手动隐藏加载屏幕（调试用）
document.getElementById('appLoader')?.remove()
```

## 🌟 浏览器兼容性

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

### 功能兼容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|---------|---------|---------|------|
| 基础功能 | ✅ | ✅ | ✅ | ✅ |
| 拖拽上传 | ✅ | ✅ | ✅ | ✅ |
| 背景模糊 | ✅ | ✅ | ⚠️ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受使用公告板的乐趣！** 🎉
