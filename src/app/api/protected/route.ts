import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiAuth';

// 受保护的GET API
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'default';
    
    // 执行受保护的操作
    return NextResponse.json({
      success: true,
      user: { username: user.username },
      action,
      message: `你好，${user.username}！这是一个受保护的API。`,
      time: new Date().toISOString()
    });
  });
}

// 受保护的POST API
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // 解析请求体
      const body = await req.json();
      
      // 执行受保护的操作
      return NextResponse.json({
        success: true,
        user: { username: user.username },
        receivedData: body,
        message: `数据已接收，${user.username}！`,
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error('处理请求失败:', error);
      return NextResponse.json(
        { error: '处理请求失败', message: '无效的请求数据' },
        { status: 400 }
      );
    }
  });
} 