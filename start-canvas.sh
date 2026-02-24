#!/bin/bash

# OneCompany Canvas 快速启动脚本
# 自动安装依赖、构建项目、启动 Canvas 并打开浏览器

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  Canvas Skill Manager                          ║"
echo "║              OneCompany 可视化配置工具                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查 Node.js
echo -e "${CYAN}🔍 检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js 20+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 版本过低 (当前: $(node -v))，需要 20+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 首次运行，正在安装依赖...${NC}"
    npm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

# 检查是否需要构建
if [ ! -d "packages/canvas-app/dist" ]; then
    echo -e "${YELLOW}🔨 首次运行，正在构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${GREEN}✅ 项目已构建${NC}"
fi

# 检查端口是否被占用
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  端口 5173 已被占用${NC}"
    echo -e "${CYAN}正在尝试关闭占用进程...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo ""
echo -e "${GREEN}🚀 启动 Canvas Skill Manager...${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📍 访问地址: ${GREEN}http://localhost:5173/${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   • 在 Canvas 中选择项目查看配置"
echo -e "   • 拖拽 Skills 和 Agents 到画布"
echo -e "   • 按 ${GREEN}Ctrl+C${NC} 停止服务"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 等待 2 秒后自动打开浏览器
sleep 2

# 自动打开浏览器
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:5173/
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:5173/
elif command -v start &> /dev/null; then
    # Windows
    start http://localhost:5173/
fi

# 启动 Canvas 应用
cd packages/canvas-app
npm run dev
