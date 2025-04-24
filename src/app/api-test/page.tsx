'use client';

import React, { useState } from 'react';
import { useCurrentUser, callProtectedApi } from '@/lib/authClient';

export default function ApiTestPage() {
  const { user, loading } = useCurrentUser();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [postData, setPostData] = useState<string>('{ "message": "Hello from client" }');

  // GET请求测试
  const handleTestGet = async () => {
    setApiLoading(true);
    setApiError(null);
    
    try {
      const response = await callProtectedApi('/api/protected?action=test');
      setApiResponse(response);
    } catch (error: any) {
      setApiError(error.message || '请求失败');
    } finally {
      setApiLoading(false);
    }
  };
  
  // POST请求测试
  const handleTestPost = async () => {
    setApiLoading(true);
    setApiError(null);
    
    try {
      // 解析JSON数据
      let data;
      try {
        data = JSON.parse(postData);
      } catch (e) {
        setApiError('无效的JSON数据');
        setApiLoading(false);
        return;
      }
      
      const response = await callProtectedApi('/api/protected', 'POST', data);
      setApiResponse(response);
    } catch (error: any) {
      setApiError(error.message || '请求失败');
    } finally {
      setApiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">API认证测试</h1>
        
        {!user ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            您尚未登录。请先<a href="/login?from=/api-test" className="underline font-medium">登录</a>后测试API。
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">当前用户</h2>
              <p className="text-blue-600">
                你好，<span className="font-medium">{user.username}</span>
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* GET测试 */}
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">测试 GET 请求</h2>
                <button
                  onClick={handleTestGet}
                  disabled={apiLoading}
                  className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${apiLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {apiLoading ? '请求中...' : '发送 GET 请求'}
                </button>
              </div>
              
              {/* POST测试 */}
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">测试 POST 请求</h2>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">JSON数据</label>
                  <textarea
                    value={postData}
                    onChange={(e) => setPostData(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded-md"
                    disabled={apiLoading}
                  />
                </div>
                <button
                  onClick={handleTestPost}
                  disabled={apiLoading}
                  className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${apiLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {apiLoading ? '请求中...' : '发送 POST 请求'}
                </button>
              </div>
            </div>
            
            {/* 响应结果 */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">API响应</h2>
              
              {apiError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {apiError}
                </div>
              )}
              
              {apiResponse && (
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              )}
            </div>
          </>
        )}
        
        {/* 返回按钮 */}
        <div className="mt-8">
          <a
            href="/"
            className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
} 