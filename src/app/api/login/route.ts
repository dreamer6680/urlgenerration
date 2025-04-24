import { NextRequest, NextResponse } from 'next/server';
import { signJWT, setAuthCookie, verifyUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 收到登录请求');
    const body = await request.json();
    const { username, password } = body;
    
    console.log(`[API] 登录用户: ${username}`);
    
    // 验证参数
    if (!username || !password) {
      console.log('[API] 缺少用户名或密码');
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 验证用户
    if (!verifyUser(username, password)) {
      console.log('[API] 用户名或密码错误');
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 生成JWT - 现在是异步的，需要await
    console.log('[API] 用户验证成功，生成JWT');
    const token = await signJWT(username);
    
    // 设置Cookie - 使用await
    console.log('[API] 设置Cookie');
    await setAuthCookie(token);
    console.log('[API] Cookie设置完成');
    
    // 返回成功响应
    console.log('[API] 登录成功');
    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: { username }
    });
  } catch (error) {
    console.error('[API] 登录失败:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 