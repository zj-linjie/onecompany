/**
 * OneCompany 配置
 * 包含 skill-factory 路径等全局配置
 */

import { homedir } from "node:os";
import { join } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

export interface OneCompanyConfig {
  skillFactoryPath: string;
  version: string;
}

const DEFAULT_CONFIG: OneCompanyConfig = {
  skillFactoryPath: "/Users/apple/dev/skill-factory",
  version: "0.1.0",
};

/**
 * 获取配置文件路径
 */
function getConfigPath(): string {
  return join(homedir(), ".onecompany", "config.json");
}

/**
 * 加载配置
 */
export async function loadConfig(): Promise<OneCompanyConfig> {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    // 首次运行，创建默认配置
    await saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  try {
    const content = await readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error("Failed to load config, using defaults:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 保存配置
 */
export async function saveConfig(config: OneCompanyConfig): Promise<void> {
  const configPath = getConfigPath();
  const configDir = join(homedir(), ".onecompany");

  // 确保目录存在
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }

  await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * 更新 skill-factory 路径
 */
export async function updateSkillFactoryPath(path: string): Promise<void> {
  const config = await loadConfig();
  config.skillFactoryPath = path;
  await saveConfig(config);
}

/**
 * 获取 skill-factory 路径
 */
export async function getSkillFactoryPath(): Promise<string> {
  const config = await loadConfig();
  return config.skillFactoryPath;
}
