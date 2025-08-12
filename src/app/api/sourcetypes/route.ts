import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 查询来源类型列表
    const sourceTypesRaw = await query('SELECT * FROM sourcetype ORDER BY id ASC') as any[];
    
    // 转换字段名以匹配FastGPTWorkflow的期望格式
    const sourceTypes = sourceTypesRaw.map(item => ({
      id: item.id,
      name: item.sourcetype,
      name_en: item.en
    }));
    
    return NextResponse.json({
      success: true,
      sourceTypes: sourceTypes
    });
  } catch (error) {
    console.error('获取来源类型列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取来源类型列表失败' },
      { status: 500 }
    );
  }
}

// 添加新来源类型的API
export async function POST(request: NextRequest) {
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
}