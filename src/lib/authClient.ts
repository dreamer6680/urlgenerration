// 客户端认证工具
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  username: string;
}

// 从客户端获取当前用户信息
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await axios.get('/api/user');
    return response.data.user || null;
  } catch (error) {
    console.error('获取用户信息失败', error);
    return null;
  }
}

// 使用React hook获取用户信息 - 只在组件加载时检查一次
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 刷新用户信息的函数
  const refreshUser = async () => {
    try {
      setLoading(true);
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('获取用户信息失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 只在组件加载时检查一次用户状态
  useEffect(() => {
    refreshUser();
  }, []);

  return { user, loading, refreshUser };
}

// 登录函数
export async function login(username: string, password: string) {
  try {
    const response = await axios.post('/api/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('登录失败', error);
    throw error;
  }
}

// 设置一次性绕过中间件标记
export function setBypassMiddleware(): void {
  localStorage.setItem('bypass_auth_redirect', 'true');
}

// 调用受保护的API
export async function callProtectedApi(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 包含cookies中的认证token
    };
    
    
    // 添加请求体（如果有）
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    // 发送请求
    const response = await fetch(endpoint, options);
    
    // 处理认证错误
    if (response.status === 401) {
      // 重定向到登录页
      if (typeof window !== 'undefined') {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
      throw new Error('未认证');
    }
    
    // 解析JSON响应
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '请求失败');
    }
    
    return result;
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
} 