'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">页面未找到</h2>
        <p className="text-gray-600 mb-6">
          您访问的链接不存在或已失效。如果您认为这是一个错误，请联系我们的支持团队。
        </p>
      </div>
    </div>
  );
}