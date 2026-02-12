// 快速测试 - 60秒超时
const path = require("path");
const mb = require(path.join(__dirname, "..", "dist", "index.js"));

async function test() {
  console.log('🧪 快速测试 - 60秒超时\n');
  
  const result = await mb.notify({
    message: '🧪 快速测试\n\n请回复任意内容（60秒内）',
    timeout: 60,
  });
  
  console.log('\n📊 结果:');
  console.log('  状态:', result.status);
  if (result.status === 'replied') {
    console.log('  ✅ 回复:', result.reply);
    console.log('  用户:', result.replyUser);
    console.log('  时间:', result.timestamp);
  } else if (result.status === 'timeout') {
    console.log('  ⏱️  超时');
  }
  
  mb.close();
  process.exit(0);
}

test().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
