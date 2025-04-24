import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { project_code: string } }
) {
  try {
    console.log(`[JSON API] 请求项目: ${params.project_code}`);
    
    // 从数据库获取项目workflow数据
    const results = await query(
      'SELECT workflow FROM workflow WHERE project_code = ?',
      [params.project_code]
    ) as any[];
    
    // 如果没有找到匹配的项目，返回404
    if (!results || results.length === 0) {
      console.log(`[JSON API] 未找到项目: ${params.project_code}`);
      return NextResponse.json(
        { error: '未找到', message: '未找到请求的项目' },
        { status: 404 }
      );
    }
    
    // 获取JSON数据
    const workflow = results[0].workflow;
    
    // 设置响应头，表明这是JSON数据
    return NextResponse.json(
      workflow,
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // 允许跨域访问
        }
      }
    );
  } catch (error: any) {
    console.error(`[JSON API] 错误:`, error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
} 