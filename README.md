# 📢 创意公告板

一个现代化的公告板应用，支持富文本编辑、图片上传和智能存储。

## ✨ 特性

- 📝 **富文本编辑器** - 支持格式化文本、字体、颜色等
- 🖼️ **图片支持** - 拖拽上传、图片预览和查看器
- 🔍 **搜索筛选** - 快速查找和分类浏览
- 🌙 **主题切换** - 明暗主题自由切换
- 💾 **智能存储** - 自动判断存储模式
- 📱 **响应式设计** - 适配各种设备

## 🚀 快速开始

### 方法一：双击启动（推荐）

1. 确保已安装 [Node.js](https://nodejs.org/)
2. 双击 `start-server.bat` 文件
3. 浏览器打开 `http://localhost:3001`

### 方法二：手动启动

```bash
# 在项目目录下打开终端
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: '使用本地存储' }));
    return;
  }
  
  if (pathname === '/') pathname = '/index.html';
  
  const filePath = path.join(__dirname, pathname);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css', 
      '.js': 'application/javascript'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(3001, () => {
  console.log('服务器启动: http://localhost:3001');
});
"
```

## 💾 存储模式

应用会**自动判断**使用哪种存储模式：

### 🏠 本地存储模式（默认）
- ✅ **无需配置** - 开箱即用
- 💾 **浏览器存储** - 数据保存在本地浏览器
- 🚀 **启动快速** - 无需额外服务

### 🗄️ 数据库存储模式（自动检测）
- 🔄 **自动检测** - 如果检测到数据库服务，自动使用
- 💪 **功能完整** - 支持更多高级功能
- 🌐 **多端同步** - 数据在多设备间同步

> **智能切换**：应用启动时会自动尝试连接数据库，如果连接失败会自动使用本地存储，用户无需手动切换。

## 📋 功能说明

### 富文本编辑
- **格式化**：粗体、斜体、下划线、删除线
- **对齐**：左对齐、居中、右对齐、两端对齐
- **列表**：有序列表、无序列表、缩进控制
- **样式**：字体、字号、文字颜色、背景色
- **间距**：行间距、段落间距调整

### 图片功能
- **上传方式**：拖拽上传或点击选择
- **格式支持**：JPG、PNG、GIF、WebP
- **图片预览**：实时预览上传的图片
- **图片查看器**：全屏查看、左右切换

### 搜索筛选
- **全文搜索**：标题和内容搜索
- **筛选选项**：
  - 全部公告
  - 今日发布
  - 包含图片

### 数据管理
- **导出功能**：导出所有数据为JSON格式
- **导入功能**：从JSON文件恢复数据
- **清空数据**：一键清除所有公告

## 🎨 主题

支持明暗两种主题：
- 🌞 **明亮主题** - 适合白天使用
- 🌙 **暗色主题** - 适合夜间使用

点击右上角的主题切换按钮即可切换。

## 🛠️ 技术栈

- **前端**：原生 JavaScript + HTML5 + CSS3
- **后端**：Node.js + Express（可选）
- **数据库**：SQLite（可选）
- **存储**：localStorage（本地）/ SQLite（数据库）

## 📱 浏览器兼容性

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

## 🔧 开发

### 项目结构

```
jessi53/
├── index.html          # 主页面
├── start-server.bat    # 启动脚本
├── README.md          # 说明文档
├── css/               # 样式文件
│   ├── style.css      # 主要样式
│   └── animations.css # 动画样式
├── js/                # JavaScript文件
│   ├── main.js        # 主程序
│   ├── ui.js          # UI管理
│   ├── storage.js     # 本地存储
│   ├── api-storage.js # API存储
│   ├── storage-manager.js # 存储管理器
│   └── utils.js       # 工具函数
└── server/            # 服务器文件（可选）
    ├── app.js         # Express应用
    ├── database.js    # 数据库操作
    └── init-db.js     # 数据库初始化
```

### 自定义配置

可以修改以下文件来自定义应用：

- `css/style.css` - 修改界面样式
- `js/utils.js` - 添加工具函数
- `js/main.js` - 修改主要逻辑

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受使用创意公告板！** 🎉
