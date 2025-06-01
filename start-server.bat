@echo off
chcp 65001 >nul
cls

echo.
echo =================================
echo     创意公告板 - 简化版本
echo =================================

REM 检查Node.js是否已安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js已安装

REM 创建简单的Express服务器（不使用数据库）
echo.
echo 📡 启动本地服务器...

node -e "
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.static(__dirname));

app.get('/api/health', (req, res) => {
  res.json({ success: false, message: '数据库未启用，使用本地存储' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('✅ 服务器启动成功！');
  console.log('🌐 本地访问地址: http://localhost:' + PORT);
  console.log('📝 当前使用本地存储模式');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
});
" 2>nul

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Express未安装，正在使用Node.js内置服务器...
    echo.
    
    node -e "
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    const url = require('url');

    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      let pathname = parsedUrl.pathname;
      
      // API路由返回失败，表示使用本地存储
      if (pathname.startsWith('/api/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '数据库未启用，使用本地存储' }));
        return;
      }
      
      // 静态文件服务
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
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        }[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    server.listen(3001, () => {
      console.log('✅ 服务器启动成功！');
      console.log('🌐 本地访问地址: http://localhost:3001');
      console.log('📝 当前使用本地存储模式');
      console.log('');
      console.log('按 Ctrl+C 停止服务器');
    });
    "
)

pause 