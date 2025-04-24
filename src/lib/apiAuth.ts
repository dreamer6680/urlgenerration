import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

// API鉴权中间件
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: { username: string }) => Promise<NextResponse>
) {
  try {
    console.log('[API鉴权] 验证请求认证状态');
    // 获取当前用户
    const user = await getCurrentUser(req);
    
    // 如果未认证，返回401
    if (!user) {
      console.log('[API鉴权] 未认证请求');
      return NextResponse.json(
        { error: '未认证', message: '请先登录' },
        { status: 401 }
      );
    }
    
    console.log(`[API鉴权] 用户已认证: ${user.username}`);
    // 调用处理函数，传入用户信息
    return handler(req, user);
  } catch (error) {
    console.error('[API鉴权] 错误:', error);
    return NextResponse.json(
      { error: '认证失败', message: '请重新登录' },
      { status: 401 }
    );
  }
}

// 简化版API鉴权辅助函数
export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
} 