import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import NotFound from '../not-found';

// 确保路由是动态的
export const dynamic = 'force-dynamic';

export default async function CatchAllRoute({ params }: { params: { slug: string[] } }) {
  // 确保params是已解析的
  const paramValues = await Promise.resolve(params);
  const slug = paramValues.slug;

  // 验证slug格式
  if (!slug || slug.length !== 2) {
    console.log('[服务器端] 无效的slug格式:', slug);
    return <NotFound />;
  }

  // 解码URL参数
  let platform = slug[0];
  let projectCode = slug[1];
  
  try {
    console.log(`[服务器端] 原始路径参数: 平台=${platform}, 项目代号=${projectCode}`);
    
    // 尝试标准解码
    try {
      const decodedPlatform = decodeURIComponent(platform);
      const decodedProjectCode = decodeURIComponent(projectCode);
      platform = decodedPlatform;
      projectCode = decodedProjectCode;
      console.log(`[服务器端] 解码后参数: 平台=${platform}, 项目代号=${projectCode}`);
    } catch (e) {
      console.error("[服务器端] 解码URL参数失败:", e);
    }
    
    // 特殊处理B站
    if (platform.startsWith('B') || platform.includes('B%')) {
      platform = 'B站';
      console.log(`[服务器端] 特殊处理B站: 平台=${platform}`);
    }

    // 特殊处理B站测试链接
    if (platform === 'B站' && projectCode === '1233') {
      console.log('[服务器端] B站测试链接，直接重定向到GitHub');
      return redirect('https://github.com');
    }
  
    console.log(`[服务器端] 查询数据库: 平台=${platform}, 项目代号=${projectCode}`);
    
    // 查询数据库获取长链接
    const rows: any = await query(
      'SELECT long_url as longUrl FROM platformmatch WHERE abbreviation = ? AND project_code = ? LIMIT 1',
      [platform, projectCode]
    );
    
    console.log(`[服务器端] 查询结果:`, rows?.length ? '找到匹配记录' : '未找到匹配记录');
    
    // 如果找到匹配的链接，执行重定向
    if (rows && rows.length > 0) {
      const longUrl = rows[0].longUrl;
      console.log(`[服务器端] 重定向到: ${longUrl}`);
      
      // 通过客户端组件进行重定向
      if (longUrl.includes('中文') || longUrl.includes('?')) {
        // 包含中文或查询参数的URL，使用客户端组件重定向
        return (
          <RedirectFallback url={longUrl} />
        );
      } else {
        // 普通URL使用服务器端重定向
        return redirect(longUrl);
      }
    }

    console.log('[服务器端] 未找到匹配链接');
    return <NotFound />;
  } catch (error) {
    console.error('[服务器端] 处理重定向出错:', error);
    return <NotFound />;
  }
}

// 服务器端组件中嵌入客户端组件作为后备方案
function RedirectFallback({ url }: { url: string }) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${url}`} />
    </>
  );
}