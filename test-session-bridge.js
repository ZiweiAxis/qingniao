// Session Bridge 快速测试
const { getSessionBridge } = require('./session-bridge.js');

async function test() {
  console.log('🧪 Session Bridge 测试\n');
  
  try {
    const bridge = await getSessionBridge();
    
    console.log('1. 初始状态:');
    let status = bridge.getStatus();
    console.log(`   平台: ${status.platformName}`);
    console.log(`   会话ID: ${status.sessionId}`);
    console.log(`   上下文: ${status.contextLength} 条\n`);
    
    // 模拟用户说「切到飞书」
    console.log('2. 用户说: "切到飞书"\n');
    const result = await bridge.handleMessage('切到飞书');
    
    console.log('   结果:');
    console.log(`   - 是否切换: ${result.switched}`);
    console.log(`   - 目标平台: ${result.platform}`);
    console.log(`   - 提示: ${result.message}\n`);
    
    // 显示切换后状态
    console.log('3. 切换后状态:');
    status = bridge.getStatus();
    console.log(`   平台: ${status.platformName}`);
    console.log(`   等待切回: ${status.isWaitingForSwitch}\n`);
    
    console.log('✅ 测试完成！');
    console.log('\n💡 提示: 在飞书上说「切回来」可以切回终端');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

test();
