'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../../lib/authClient';

// 仪表盘页面 - 受保护的路由
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  
  // 当认证状态变化时检查
  useEffect(() => {
    if (!loading && !user) {
      // 如果用户未登录且加载完成，重定向到登录页
      router.push('/login?from=/dashboard');
    }
  }, [user, loading, router]);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }
  
  // 如果没有用户且已加载完成，说明重定向正在进行中，显示空内容
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">仪表盘</h1>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold text-blue-700">欢迎回来！</h2>
            <p className="text-blue-600">
              你好，<span className="font-medium">{user.username}</span>
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">你的信息</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="mb-2">
                <span className="font-medium">用户名：</span> {user.username}
              </p>
              <p className="mb-2">
                <span className="font-medium">登录状态：</span> 
                <span className="text-green-600">已登录</span>
              </p>
              <p>
                <span className="font-medium">JWT 有效期：</span> 7天
              </p>
            </div>
          </div>
          
          <div>
            <a 
              href="/" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 