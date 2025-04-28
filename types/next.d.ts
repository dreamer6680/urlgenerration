import { NextRequest } from 'next/server';

// 修复API路由参数类型问题
declare module 'next/dist/server/web/spec-extension/request' {
  interface Params {
    [param: string]: string | string[];
  }
}

// 扩展路由上下文类型
declare module 'next/dist/server/future/route-modules/app-route/module' {
  interface RouteContext {
    params: {
      [param: string]: string | string[];
    };
  }
} 