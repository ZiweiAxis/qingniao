/**
 * MessageBridge - 消息队列管理
 */

import { TaskInfo } from "./types.ts";

// 内存消息队列（MVP）
class MemoryQueue {
  private tasks: Map<string, TaskInfo> = new Map();
  private pendingResolves: Map<string, (result: TaskInfo) => void> = new Map();

  createTask(params: Omit<TaskInfo, "taskId" | "createdAt" | "status">): TaskInfo {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: TaskInfo = {
      ...params,
      taskId,
      createdAt: new Date(),
      status: "pending",
    };
    
    this.tasks.set(taskId, task);
    return task;
  }

  getTask(taskId: string): TaskInfo | undefined {
    return this.tasks.get(taskId);
  }

  updateTask(taskId: string, updates: Partial<TaskInfo>): void {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
    }
  }

  waitForReply(taskId: string, timeoutSeconds: number): Promise<TaskInfo> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResolves.delete(taskId);
        const task = this.tasks.get(taskId);
        if (task) {
          task.status = "timeout";
        }
        reject(new Error("Timeout waiting for reply"));
      }, timeoutSeconds * 1000);

      this.pendingResolves.set(taskId, (task) => {
        clearTimeout(timeout);
        resolve(task);
      });
    });
  }

  resolveTask(taskId: string, reply: string, replyUser: string, replyUserId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = "replied";
      task.reply = reply;
      task.replyUser = replyUser;
      task.replyUserId = replyUserId;
      task.repliedAt = new Date();
      
      const resolve = this.pendingResolves.get(taskId);
      if (resolve) {
        resolve(task);
        this.pendingResolves.delete(taskId);
      }
    }
  }

  getAllTasks(): TaskInfo[] {
    return Array.from(this.tasks.values());
  }

  cleanupOldTasks(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [taskId, task] of this.tasks) {
      if (now - task.createdAt.getTime() > maxAgeMs) {
        this.tasks.delete(taskId);
      }
    }
  }
}

// 单例实例
export const messageQueue = new MemoryQueue();
