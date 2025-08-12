import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 查询平台列表
    const platformsRaw = await query('SELECT * FROM platform ORDER BY id ASC') as any[];
    
    // 转换字段名以匹配FastGPTWorkflow的期望格式
    const platforms = platformsRaw.map(item => ({
      id: item.id,
      name: item.platform,
      abbreviation: item.abbreviation
    }));
    
    return NextResponse.json({
      success: true,
      platforms: platforms
    });
  } catch (error) {
    console.error('获取平台列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取平台列表失败' },
      { status: 500 }
    );
  }
}

// 添加新平台的API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, abbreviation } = body;

    // 验证参数
    if (!platform || !abbreviation) {
      return NextResponse.json(
        { error: '平台名称和缩写不能为空' },
        { status: 400 }
      );
    }

    // 检查平台是否已存在
    const existingPlatforms = await query(
      'SELECT * FROM platform WHERE platform = ? OR abbreviation = ?',
      [platform, abbreviation]
    ) as any[];

    if (existingPlatforms && existingPlatforms.length > 0) {
      return NextResponse.json(
        { error: '平台名称或缩写已存在' },
        { status: 409 }
      );
    }

    // 插入新平台
    await query(
      'INSERT INTO platform (platform, abbreviation) VALUES (?, ?)',
      [platform, abbreviation]
    );

    // 获取新插入的平台ID
    const [result] = await query('SELECT LAST_INSERT_ID() as id') as any[];
    const insertId = result.id;

    // 返回新创建的平台
    return NextResponse.json({
      id: insertId,
      platform,
      abbreviation
    });
  } catch (error) {
    console.error('添加平台失败:', error);
    return NextResponse.json(
      { error: '添加平台失败' },
      { status: 500 }
    );
  }
}