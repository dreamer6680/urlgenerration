import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db'; // 你可以根据项目使用别名或相对路径

interface Params {
  project_code: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Params }  // 使用明确的 Params 类型
) {
  const { project_code } = params;

  try {
    console.log(`[JSON API] 请求项目: ${project_code}`);

    const results = await query(
      'SELECT workflow FROM workflow WHERE project_code = ?',
      [project_code]
    ) as any[];

    if (!results || results.length === 0) {
      console.log(`[JSON API] 未找到项目: ${project_code}`);
      return NextResponse.json(
        { error: '未找到', message: '未找到请求的项目' },
        { status: 404 }
      );
    }

    const workflow = results[0].workflow;

    return NextResponse.json(workflow, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // 允许跨域访问
      }
    });
  } catch (error: any) {
    console.error('[JSON API] 错误:', error);
    return NextResponse.json(
      { error: '服务器错误', message: error.message },
      { status: 500 }
    );
  }
}
