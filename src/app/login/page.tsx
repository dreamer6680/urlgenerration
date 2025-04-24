"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, useCurrentUser } from '@/lib/authClient';

export default function LoginPage() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from') || '/';
  
  // 检查用户是否已登录
  const { user, loading: userLoading, refreshUser } = useCurrentUser();
  
  // 如果用户已登录或登录成功，跳转到目标页面
  useEffect(() => {
    if ((user || loginSuccess) && !userLoading) {
      console.log('[登录页] 登录成功，跳转到:', fromUrl);
      
      // 使用setTimeout确保浏览器有时间处理cookie
      setTimeout(() => {
        console.log('[登录页] 执行跳转');
        // 使用window.location.href强制页面跳转
        window.location.href = fromUrl;
      }, 1000);
    }
  }, [user, userLoading, loginSuccess, fromUrl]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置错误状态
    setError('');
    
    // 验证输入
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }
    
    try {
      setLoading(true);
      
      // 调用登录函数
      console.log('[登录页] 尝试登录...');
      const response = await login(username, password);
      
      // 登录成功
      if (response.success) {
        console.log('[登录页] 登录API返回成功');
        setLoginSuccess(true);
        
        // 刷新用户状态
        await refreshUser();
        
        // 延迟跳转，确保cookie已设置
        setTimeout(() => {
          console.log('[登录页] 执行延迟跳转');
          window.location.href = fromUrl;
        }, 1000);
      } else {
        // 登录失败但返回了成功状态
        console.log('[登录页] 登录API返回成功状态但可能有问题');
        setError('登录失败，请稍后重试');
      }
    } catch (error: any) {
      // 显示错误信息
      console.error('[登录页] 登录错误:', error);
      setError(error.response?.data?.error || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 如果用户已登录，显示正在跳转的提示
  if (user && !userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">已登录，正在跳转...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录账户
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {loginSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            登录成功，正在跳转...
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">用户名</label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                disabled={loading || loginSuccess}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                disabled={loading || loginSuccess}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || loginSuccess}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || loginSuccess) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? '登录中...' : loginSuccess ? '登录成功' : '登录'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>提示: 默认用户名 admin，密码 password123</p>
          </div>
        </form>
      </div>
    </div>
  );
} 