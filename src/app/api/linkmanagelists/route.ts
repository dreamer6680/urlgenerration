import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 查询链接列表
    const links = await query(`
      SELECT 
        id,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        source_type as sourceType,
        platform_name as platform,
        project_code as projectCode,
        description,
        short_url as shortUrl,
        long_url as longUrl
      FROM link_workflow_info
      ORDER BY created_at DESC
    `) as any[];
    
    return NextResponse.json(links);
  } catch (error) {
    console.error('获取链接列表失败:', error);
    return NextResponse.json(
      { error: '获取链接列表失败' },
      { status: 500 }
    );
  }
}