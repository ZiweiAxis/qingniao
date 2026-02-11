/**
 * AI Wrapper 使用示例
 * 
 * 演示如何约束 AI 工具的行为
 */

const { executeWithConfirmation, executeBatchWithConfirmation } = require("./ai-wrapper");
const fs = require("fs").promises;

// 示例 1：单个敏感操作
async function example1_deleteFiles() {
  console.log("示例 1：删除文件（需要确认）\n");

  await executeWithConfirmation({
    taskDescription: "删除 /tmp 目录下的临时文件",
    riskLevel: "high",
    timeout: 120,
    details: {
      "目标目录": "/tmp",
      "文件数量": "约 100 个",
      "总大小": "50MB",
    },
    taskFn: async () => {
      // 实际执行删除
      console.log("  执行删除操作...");
      // await fs.rm("/tmp/*", { recursive: true });
      console.log("  删除完成");
      return { deleted: 100, size: "50MB" };
    },
  });
}

// 示例 2：批量操作
async function example2_batchOperations() {
  console.log("\n示例 2：批量操作（用户选择）\n");

  const operations = [
    {
      description: "更新依赖包",
      taskFn: async () => {
        console.log("  更新依赖包...");
        return { updated: 5 };
      },
    },
    {
      description: "清理缓存",
      taskFn: async () => {
        console.log("  清理缓存...");
        return { cleared: "100MB" };
      },
    },
    {
      description: "重启服务",
      taskFn: async () => {
        console.log("  重启服务...");
        return { restarted: true };
      },
    },
  ];

  const results = await executeBatchWithConfirmation({
    operations,
    timeout: 180,
  });

  console.log("\n批量操作结果:", results);
}

// 示例 3：低风险操作（仍需确认）
async function example3_lowRisk() {
  console.log("\n示例 3：低风险操作\n");

  await executeWithConfirmation({
    taskDescription: "生成报告文件",
    riskLevel: "low",
    timeout: 60,
    details: {
      "输出路径": "./report.pdf",
      "数据来源": "数据库",
    },
    taskFn: async () => {
      console.log("  生成报告...");
      return { file: "./report.pdf", size: "2MB" };
    },
  });
}

// 主函数
async function main() {
  console.log("🚀 AI Wrapper 使用示例\n");
  console.log("=" .repeat(50));

  try {
    // 运行示例 1
    await example1_deleteFiles();

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 运行示例 2
    await example2_batchOperations();

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 运行示例 3
    await example3_lowRisk();

    console.log("\n" + "=".repeat(50));
    console.log("\n✅ 所有示例完成！");
  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    console.error("   错误代码:", error.code);
  }

  process.exit(0);
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = {
  example1_deleteFiles,
  example2_batchOperations,
  example3_lowRisk,
};
