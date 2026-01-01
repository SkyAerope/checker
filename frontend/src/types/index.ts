// 检查状态枚举
export type CheckStatus = 'valid' | 'invalid' | 'unknown';

// 后端响应格式
export interface CheckResponse {
  status: CheckStatus;
  detail?: string;
}

// 检查结果项
export interface CheckResultItem {
  data: string;
  status: CheckStatus;
  detail?: string;
}

// 应用配置
export interface AppConfig {
  backendUrl: string;
}
