import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import * as jose from 'jose';

// JWT密钥（应该放在环境变量中）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

// Token过期时间
const EXPIRES_IN = '7d';

// 模拟用户数据（实际应用中应从数据库获取）
const USERS = {
  admin: 'password123',
};

// 生成JWT
export async function signJWT(username: string) {
  try {
    // 创建JWT
    const token = await new jose.SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(EXPIRES_IN)
      .sign(JWT_SECRET_BYTES);
      
    return token;
  } catch (error) {
    console.error('JWT生成失败:', error);
    throw error;
  }
}

// 验证JWT
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET_BYTES, {
      algorithms: ['HS256'],
    });
    
    return payload as { username: string };
  } catch (error) {
    console.error('JWT验证失败:', error);
    return null;
  }
}

// 验证用户
export function verifyUser(username: string, password: string) {
  // 使用数据库中设置的默认用户
  if (username === 'admin' && password === 'password123') {
    return true;
  }
  return USERS[username as keyof typeof USERS] === password;
}

// =================== 服务器端认证函数 ===================

// 设置认证Cookie - 仅在服务器端使用
export async function setAuthCookie(token: string) {
  try {
    const cookieStore = await cookies();
    
    // 确保使用更安全和明确的设置
    await cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
      sameSite: 'lax', // 防止CSRF攻击，同时允许从外部链接进行导航
    });
    
    console.log('Cookie已成功设置');
  } catch (error) {
    console.error('设置Cookie失败:', error);
    throw error;
  }
}

// 获取当前用户 - 仅在服务器端使用
export async function getCurrentUser(req?: NextRequest) {
  try {
    let token;
    
    if (req) {
      // 中间件中使用
      token = req.cookies.get('auth_token')?.value;
      console.log('从请求获取token:', token ? '已找到' : '未找到');
    } else {
      // 服务器组件中使用
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
      console.log('从cookie store获取token:', token ? '已找到' : '未找到');
    }
    
    if (!token) {
      console.log('未找到认证token');
      return null;
    }
    
    const user = await verifyJWT(token);
    console.log('用户认证结果:', user ? '认证成功' : '认证失败');
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
} 