import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// 提取UTM参数的辅助函数
function extractUTMParams(url: string) {
  const urlObj = new URL(url);
  return {
    utm_source: urlObj.searchParams.get('utm_source'),
    utm_medium: urlObj.searchParams.get('utm_medium'),
    utm_content: urlObj.searchParams.get('utm_content'),
    utm_campaign: urlObj.searchParams.get('utm_campaign'),
    utm_workflow: urlObj.searchParams.get('utm_workflow')
  };
}

// 获取客户端IP地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

export async function GET(request: NextRequest) {
  // 获取URL参数
  const { searchParams } = new URL(request.url);
  const shortChainId = searchParams.get('shortChainId');
  
  // 验证参数
  if (!shortChainId) {
    return new NextResponse('Missing parameters', { status: 404 });
  }
  
  try {
    // 查询数据库获取链接信息
    const rows: any = await query(
      'SELECT id, long_url as longUrl FROM link_info WHERE id = ? LIMIT 1',
      [shortChainId]
    );
    
    // 如果找到匹配的链接，记录点击统计并执行重定向
    if (rows && rows.length > 0) {
      const linkId = rows[0].id;
      const longUrl = rows[0].longUrl;
      
      // 提取UTM参数
      const utmParams = extractUTMParams(longUrl);
      
      // 获取访问者信息
      const ipAddress = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';
      const referer = request.headers.get('referer') || '';
      
      // 记录点击统计（异步执行，不阻塞重定向）
      query(
        `INSERT INTO click_analytics (
          link_id, ip_address, user_agent, referer, 
          utm_source, utm_medium, utm_content, utm_campaign, utm_workflow
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          linkId, ipAddress, userAgent, referer,
          utmParams.utm_source, utmParams.utm_medium, utmParams.utm_content,
          utmParams.utm_campaign, utmParams.utm_workflow
        ]
      ).catch(error => {
        console.error('[点击统计] 记录失败:', error);
      });
      

      
      console.log('[API路由] 找到匹配的长链接，记录点击统计，执行重定向', longUrl);
      return NextResponse.redirect(longUrl, { status: 307 });
    }
    
    console.log('[API路由] 未找到匹配的长链接，返回404');
    return new NextResponse('Link not found', { status: 404 });
  } catch (error) {
    console.error('[API路由] 处理重定向出错:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}