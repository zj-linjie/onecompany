#!/bin/bash

# OneCompany CLI 交互式启动脚本
# 提供菜单选择，可以进入不同的功能模块

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

# 清屏函数
clear_screen() {
    clear
}

# 显示标题
show_header() {
    clear_screen
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                     OneCompany CLI                             ║"
    echo "║            AI 驱动的多 Agent 协作开发框架                       ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# 检查环境
check_environment() {
    echo -e "${CYAN}🔍 检查环境...${NC}"

    # 检查 Node.js
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
    fi

    # 检查构建
    if [ ! -d "apps/cli/dist" ]; then
        echo -e "${YELLOW}🔨 首次运行，正在构建项目...${NC}"
        npm run build
        echo -e "${GREEN}✅ 构建完成${NC}"
    fi

    echo ""
}

# 显示主菜单
show_main_menu() {
    show_header
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}请选择功能：${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}. 🤖 OneCompany CLI (完整功能)"
    echo -e "  ${GREEN}2${NC}. 🎨 Canvas 可视化界面"
    echo -e "  ${GREEN}3${NC}. ⚡ Canvas 配置管理"
    echo -e "  ${GREEN}4${NC}. 🧠 AI 智能配置"
    echo -e "  ${GREEN}5${NC}. 📊 查看项目配置"
    echo -e "  ${GREEN}6${NC}. 🔧 快速配置工具"
    echo -e "  ${GREEN}0${NC}. 🚪 退出"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# OneCompany CLI
run_onecompany_cli() {
    show_header
    echo -e "${GREEN}🤖 启动 OneCompany CLI...${NC}"
    echo ""
    npm run onecompany

    # 返回后显示提示
    echo ""
    echo -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1 -s
}

# Canvas 可视化界面
run_canvas() {
    show_header
    echo -e "${GREEN}🎨 启动 Canvas 可视化界面...${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📍 访问地址: ${GREEN}http://localhost:5173/${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 提示: 按 Ctrl+C 停止服务并返回主菜单${NC}"
    echo ""

    # 等待 2 秒后自动打开浏览器
    sleep 2

    # 自动打开浏览器
    if command -v open &> /dev/null; then
        open http://localhost:5173/
    fi

    # 启动 Canvas
    npm run canvas

    # 返回后显示提示
    echo ""
    echo -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1 -s
}

# Canvas 配置管理
run_canvas_config() {
    show_header
    echo -e "${GREEN}⚡ Canvas 配置管理${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}选择操作：${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}. 查看配置"
    echo -e "  ${GREEN}2${NC}. 添加 Skill"
    echo -e "  ${GREEN}3${NC}. 添加 Agent"
    echo -e "  ${GREEN}4${NC}. 从模板初始化"
    echo -e "  ${GREEN}5${NC}. 查看帮助"
    echo -e "  ${GREEN}0${NC}. 返回主菜单"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    read -p "请输入选项 [0-5]: " config_choice

    case $config_choice in
        1)
            echo ""
            npm run canvas-config list
            ;;
        2)
            echo ""
            echo -e "${YELLOW}可用的 Skills: react-dev, api-development, database-design, ui-design, unit-testing, authentication, state-management, docker, ci-cd${NC}"
            read -p "输入 Skill ID: " skill_id
            npm run canvas-config add-skill "$skill_id"
            ;;
        3)
            echo ""
            echo -e "${YELLOW}可用的 Agents: frontend-dev, backend-dev, fullstack-dev, devops, tester, designer${NC}"
            read -p "输入 Agent Role: " agent_role
            npm run canvas-config add-agent "$agent_role"
            ;;
        4)
            echo ""
            echo -e "${YELLOW}可用的模板: fullstack, frontend, backend${NC}"
            read -p "输入模板名称: " template
            npm run canvas-config init "$template"
            ;;
        5)
            echo ""
            npm run canvas-config help
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}❌ 无效选项${NC}"
            ;;
    esac

    echo ""
    echo -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1 -s
}

# AI 智能配置
run_ai_config() {
    show_header
    echo -e "${GREEN}🧠 AI 智能配置${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}AI 会根据你的项目需求自动推荐 Skills 和 Agents${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    npm run canvas-ai

    echo ""
    echo -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1 -s
}

# 查看项目配置
view_project_config() {
    show_header
    echo -e "${GREEN}📊 查看项目配置${NC}"
    echo ""

    # 列出所有项目
    if [ -d "workspaces" ]; then
        echo -e "${CYAN}可用的项目：${NC}"
        echo ""

        projects=($(ls -d workspaces/*/ 2>/dev/null | xargs -n 1 basename))

        if [ ${#projects[@]} -eq 0 ]; then
            echo -e "${YELLOW}⚠️  没有找到项目${NC}"
            echo ""
            echo -e "${YELLOW}按任意键返回主菜单...${NC}"
            read -n 1 -s
            return
        fi

        for i in "${!projects[@]}"; do
            echo -e "  ${GREEN}$((i+1))${NC}. ${projects[$i]}"
        done

        echo ""
        read -p "选择项目 [1-${#projects[@]}]: " project_choice

        if [[ "$project_choice" =~ ^[0-9]+$ ]] && [ "$project_choice" -ge 1 ] && [ "$project_choice" -le "${#projects[@]}" ]; then
            selected_project="${projects[$((project_choice-1))]}"
            echo ""
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${YELLOW}项目: ${selected_project}${NC}"
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""

            cd "workspaces/$selected_project"

            if [ -f ".onecompany/canvas-config.json" ]; then
                npm run canvas-config list
            else
                echo -e "${YELLOW}⚠️  该项目还没有 Canvas 配置${NC}"
                echo ""
                echo -e "${CYAN}提示: 运行 'npm run canvas-ai' 快速配置${NC}"
            fi

            cd "$SCRIPT_DIR"
        else
            echo -e "${RED}❌ 无效选项${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  workspaces 目录不存在${NC}"
    fi

    echo ""
    echo -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1 -s
}

# 快速配置工具
quick_config_menu() {
    show_header
    echo -e "${GREEN}🔧 快速配置工具${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}选择操作：${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}. 🚀 快速添加全栈配置"
    echo -e "  ${GREEN}2${NC}. 🎨 快速添加前端配置"
    echo -e "  ${GREEN}3${NC}. 🔧 快速添加后端配置"
    echo -e "  ${GREEN}4${NC}. 📱 快速添加移动端配置"
    echo -e "  ${GREEN}0${NC}. 返回主菜单"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    read -p "请输入选项 [0-4]: " quick_choice

    case $quick_choice in
        1)
            echo ""
            echo -e "${GREEN}🚀 添加全栈配置...${NC}"
            npm run canvas-config init fullstack
            ;;
        2)
            echo ""
            echo -e "${GREEN}🎨 添加前端配置...${NC}"
            npm run canvas-config init frontend
            ;;
        3)
            echo ""
            echo -e "${GREEN}🔧 添加后端配置...${NC}"
            npm run canvas-config init backend
            ;;
        4)
            echo ""
            echo -e "${GREEN}📱 添加移动端配置...${NC}"
            npm run canvas-config add-skill react-dev
            npm run canvas-config add-skill responsive-layout
            npm run canvas-config add-skill ui-design
            npm run canvas-config add-agent mobile
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}❌ 无效选项${NC}"
            ;;
    esac

    echo ""
    echo -e "${YELLOW}按任意键返回主菜单...${NC}"
    read -n 1 -s
}

# 主循环
main() {
    # 首次检查环境
    check_environment

    while true; do
        show_main_menu
        read -p "请输入选项 [0-6]: " choice

        case $choice in
            1)
                run_onecompany_cli
                ;;
            2)
                run_canvas
                ;;
            3)
                run_canvas_config
                ;;
            4)
                run_ai_config
                ;;
            5)
                view_project_config
                ;;
            6)
                quick_config_menu
                ;;
            0)
                clear_screen
                echo -e "${GREEN}👋 再见！${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 无效选项，请重新选择${NC}"
                sleep 1
                ;;
        esac
    done
}

# 捕获 Ctrl+C
trap 'echo -e "\n${YELLOW}⚠️  操作已取消${NC}"; sleep 1' INT

# 运行主程序
main
