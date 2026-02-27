#!/usr/bin/env bash
# 结束飞书会话时调用：向飞书发一条收尾消息。
# 在 Cursor 主动结束或飞书回复「切回」「结束」时执行（见 SKILL.cursor.md）。
set -e
cd "$(dirname "$0")/.."
exec npx skill-message-bridge send "会话已结束。要再聊请到 Cursor 说「切到飞书」。"
