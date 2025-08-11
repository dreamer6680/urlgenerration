import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './lib/auth';

// 不需要登录即可访问的路径
const publicPaths = ['/login', '/api/login', '/api/user', '/socket.io'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log(`[中间件] 处理路径: ${path}`);
  
  // 跳过API路由、静态资源和主页
  if (
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.startsWith('/favicon') || 
    path.startsWith('/public') || 
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/json') || // 添加对/json路径的处理，直接通过
    path.startsWith('/socket.io') // 允许Socket.io连接
  ) {
    console.log(`[中间件] 跳过处理: ${path}`);
    return NextResponse.next();
  }
  
  console.log(`[中间件] 处理路径: ${path}`);
  const segments = path.split('/').filter(Boolean);
  if (Number.isInteger(parseInt(segments[0]))) {
    const shortChainId = segments[0];
    
    console.log(`[中间件] 检测到短链格式: ${shortChainId}`);
    
    // 构建到API路由的URL
    const redirectApiUrl = new URL(`/api/redirect?shortChainId=${encodeURIComponent(shortChainId)}`, request.url);
    console.log(`[中间件] 重定向到API路由: ${redirectApiUrl.toString()}`);
    
    // 重定向到API路由处理
    return NextResponse.redirect(redirectApiUrl);
  }
  
  // 获取当前用户 - 添加await
  const user = await getCurrentUser(request);
  console.log(`[中间件] 用户状态: ${user ? '已登录' : '未登录'}`);
  
  // 如果用户已登录且试图访问登录页，重定向到首页
  if (user && path.startsWith('/login')) {
    console.log('[中间件] 已登录用户访问公开页面，重定向到首页');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 如果用户未登录且试图访问需要认证的页面，重定向到登录页
  if (!user && !publicPaths.includes(path)) {
    console.log('[中间件] 未登录用户访问受保护页面，重定向到登录页');
    const loginUrl = new URL('/login', request.url);
    // 保存原始URL，登录成功后可以重定向回来
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log('[中间件] 允许继续访问');
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 排除API路由、静态资源和其他不需要重定向的路径
    '/((?!api|_next|favicon.ico|public).*)',
  ]
}; 