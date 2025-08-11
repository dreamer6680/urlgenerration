import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(request: NextRequest) {
  // 获取URL参数
  const { searchParams } = new URL(request.url);
  const shortChainId = searchParams.get('shortChainId');
  
  
  // 验证参数
  if (!shortChainId) {
    return new NextResponse('Missing parameters', { status: 404 });
  }
  
  try {
    // 查询数据库
    const rows: any = await query(
      'SELECT long_url as longUrl FROM platformmatch WHERE id = ? LIMIT 1',
      [shortChainId]
    );
    
    // 如果找到匹配的链接，执行重定向
    if (rows && rows.length > 0) {
      const longUrl = rows[0].longUrl;
      
      // 普通URL使用标准重定向
      console.log('[API路由] 找到匹配的长链接，执行重定向', longUrl);
      return NextResponse.redirect(longUrl, { status: 307 });
    }
    
    console.log('[API路由] 未找到匹配的长链接，返回404');
    return new NextResponse('Link not found', { status: 404 });
  } catch (error) {
    console.error('[API路由] 处理重定向出错:', error);
    return new NextResponse('Server error', { status: 500 });
  }
} 