import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { withAuth } from '../../../lib/apiAuth';
import { NextRequest } from 'next/server';

// 处理POST请求 - 创建新项目
export const POST = async (req: NextRequest) => {
  return withAuth(req, async (req: NextRequest, user: { username: string }) => {
    try {
      const { projectCode, projectDescription, workflow } = await req.json();

      // 验证数据
      if (!projectCode) {
        return NextResponse.json(
          { success: false, message: '项目代码是必需的' },
          { status: 400 }
        );
      }

      // 检查projectCode是否已存在
      const existingProjects = await query(
        'SELECT * FROM workflow WHERE project_code = ?',
        [projectCode]
      ) as any[];

      if (existingProjects.length > 0) {
        return NextResponse.json(
          { success: false, message: '该项目代码已存在' },
          { status: 400 }
        );
      }

      // 验证workflow是有效的JSON（无论如何都验证，只要不是null或undefined）
      let validatedWorkflow = null;
      
      if (workflow !== null && workflow !== undefined) {
        // 如果是字符串，则尝试解析确认是有效的JSON
        if (typeof workflow === 'string') {
          // 空字符串也要验证
          if (workflow.trim() === '') {
            return NextResponse.json(
              { success: false, message: 'Workflow不能为空字符串' },
              { status: 400 }
            );
          }
          
          try {
            validatedWorkflow = JSON.parse(workflow);
          } catch (e) {
            return NextResponse.json(
              { success: false, message: 'Workflow必须是有效的JSON格式' },
              { status: 400 }
            );
          }
        } else if (typeof workflow === 'object') {
          // 如果是对象，检查是否为空对象
          if (Object.keys(workflow).length === 0) {
            return NextResponse.json(
              { success: false, message: 'Workflow不能为空对象' },
              { status: 400 }
            );
          }
          validatedWorkflow = workflow;
        } else {
          // 既不是字符串也不是对象，则不是有效的JSON
          return NextResponse.json(
            { success: false, message: 'Workflow必须是有效的JSON格式或对象' },
            { status: 400 }
          );
        }
      }

      // 生成URL
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const url = validatedWorkflow ? `${protocol}://${host}/api/json/${projectCode}` : null;

      // description可为空，转换为null避免空字符串问题
      const finalDescription = projectDescription && projectDescription.trim() ? projectDescription : null;

      // 保存到数据库
      await query(
        'INSERT INTO workflow (project_code, description, url, workflow) VALUES (?, ?, ?, ?)',
        [projectCode, finalDescription, url, validatedWorkflow ? JSON.stringify(validatedWorkflow) : null]
      );

      return NextResponse.json({
        success: true,
        message: '项目创建成功',
        url,
        projectCode,
      });
    } catch (error: any) {
      console.error('创建项目失败:', error);
      return NextResponse.json(
        { success: false, message: `创建项目时出错: ${error.message}` },
        { status: 500 }
      );
    }
  });
};

// 处理GET请求 - 获取所有项目
export const GET = async (req: NextRequest) => {
  return withAuth(req, async (req: NextRequest, user: { username: string }) => {
    try {
      const projects = await query(
        'SELECT id, project_code, url FROM workflow ORDER BY id DESC',
        []
      ) as any[];

      return NextResponse.json({
        success: true,
        projects,
      });
    } catch (error: any) {
      console.error('获取项目列表失败:', error);
      return NextResponse.json(
        { success: false, message: `获取项目列表时出错: ${error.message}` },
        { status: 500 }
      );
    }
  });
}; 