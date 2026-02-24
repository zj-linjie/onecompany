/**
 * 配置持久化工具
 */

import type { CanvasConfig } from '../types/canvas.types';

// const CONFIG_DIR = '.onecompany';
// const CONFIG_FILE = 'canvas-config.json';

/**
 * 保存配置到文件
 */
export async function saveConfig(config: CanvasConfig, workspacePath: string): Promise<void> {
  try {
    // 在浏览器环境中，我们使用 localStorage
    const configKey = `canvas-config-${workspacePath}`;
    const configJson = JSON.stringify(config, null, 2);
    localStorage.setItem(configKey, configJson);

    // 同时触发下载
    downloadConfig(config, 'canvas-config.json');
  } catch (error) {
    console.error('Failed to save config:', error);
    throw new Error('Failed to save configuration');
  }
}

/**
 * 从文件加载配置
 */
export async function loadConfig(workspacePath: string): Promise<CanvasConfig | null> {
  try {
    const configKey = `canvas-config-${workspacePath}`;
    const configJson = localStorage.getItem(configKey);

    if (!configJson) {
      return null;
    }

    const config = JSON.parse(configJson) as CanvasConfig;
    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    throw new Error('Failed to load configuration');
  }
}

/**
 * 下载配置文件
 */
export function downloadConfig(config: CanvasConfig, filename: string): void {
  const configJson = JSON.stringify(config, null, 2);
  const blob = new Blob([configJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * 从文件上传加载配置
 */
export function uploadConfig(): Promise<CanvasConfig> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        const config = JSON.parse(text) as CanvasConfig;
        resolve(config);
      } catch (error) {
        reject(new Error('Failed to parse config file'));
      }
    };

    input.click();
  });
}

/**
 * 验证配置格式
 */
export function validateConfig(config: any): config is CanvasConfig {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.version === 'string' &&
    config.project &&
    Array.isArray(config.nodes) &&
    Array.isArray(config.connections)
  );
}
