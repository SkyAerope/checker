import type { CheckResponse } from '../types';

// 检查单条数据
export async function checkData(backendUrl: string, data: string): Promise<CheckResponse> {
  const url = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// 检查后端健康状态
export async function checkHealth(backendUrl: string): Promise<boolean> {
  try {
    const url = new URL(backendUrl);
    url.pathname = '/health';

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    return response.ok;
  } catch {
    return false;
  }
}
