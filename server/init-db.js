const Database = require('./database');

async function initDatabase() {
    console.log('🔧 正在初始化数据库...');
    
    try {
        const db = new Database();
        
        // 等待数据库初始化完成
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
        
        console.log('✅ 数据库初始化完成');
        
        // 关闭数据库连接
        await db.close();
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

initDatabase(); 