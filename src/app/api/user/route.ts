import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('[API/user] 收到获取用户请求');
    
    // 获取当前用户 - 已经是异步的
    const user = await getCurrentUser(request);
    
    if (user) {
      console.log(`[API/user] 找到用户: ${user.username}`);
      // 返回用户信息
      const response = NextResponse.json({
        success: true,
        user: { username: user.username }
      });
      
      // 添加调试信息
      console.log('[API/user] 正在发送成功响应');
      return response;
    } else {
      console.log('[API/user] 未找到用户');
      // 用户未登录
      return NextResponse.json({
        success: false,
        user: null
      });
    }
  } catch (error) {
    console.error('[API/user] 获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
} 