import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { withAuth } from '../../../lib/apiAuth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req: NextRequest, user: { username: string }) => {
    try {
      // 查询来源类型列表
      const sourceTypes = await query('SELECT * FROM sourcetype ORDER BY id ASC') as any[];
      
    return NextResponse.json(sourceTypes);
  } catch (error) {
    console.error('获取来源类型列表失败:', error);
    return NextResponse.json(
      { error: '获取来源类型列表失败' },
      { status: 500 }
    );
  }
});
}

// 添加新来源类型的API
export async function POST(request: NextRequest) {
  return withAuth(request, async (request: NextRequest, user: { username: string }) => {
    try {
      const body = await request.json();
      const { sourcetype, en } = body;

    // 验证参数
    if (!sourcetype || !en) {
      return NextResponse.json(
        { error: '类型名称和英文不能为空' },
        { status: 400 }
      );
    }

    // 检查来源类型是否已存在
    const existingSourceTypes = await query(
      'SELECT * FROM sourcetype WHERE sourcetype = ? OR en = ?',
      [sourcetype, en]
    ) as any[];

    if (existingSourceTypes && existingSourceTypes.length > 0) {
      return NextResponse.json(
        { error: '来源类型或英文标识已存在' },
        { status: 409 }
      );
    }

    // 插入新来源类型
    await query(
      'INSERT INTO sourcetype (sourcetype, en) VALUES (?, ?)',
      [sourcetype, en]
    );

    // 获取新插入的ID
    const [result] = await query('SELECT LAST_INSERT_ID() as id') as any[];
    const insertId = result.id;

    // 返回新创建的来源类型
    return NextResponse.json({
      id: insertId,
      sourcetype,
      en
    });
  } catch (error) {
    console.error('添加来源类型失败:', error);
    return NextResponse.json(
      { error: '添加来源类型失败' },
      { status: 500 }
    );
  }
});
} 