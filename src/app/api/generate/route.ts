import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

function getCurrentDomain(req: NextRequest): string {
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https')? 'https' : 'http');
    if (!host) {
        throw new Error('无法获取主机信息');
    }
    return `${protocol}://${host}`;
}

const generateShortUrl = (platformAbbreviation: string, projectCode: string, currentDomain: string): string => {
    return `${currentDomain}/go?p=${encodeURIComponent(platformAbbreviation)}&c=${encodeURIComponent(projectCode)}`;
};

const generateLongUrl = (sourceTypeEn: string, abbreviation: string, projectCode: string): string => {
    return `https://cloud.fastgpt.cn/login?lastRoute=%2Fapp%2Flist&utm_source=${sourceTypeEn}&utm_medium=${abbreviation}&utm_content=${projectCode}`;
};

const createFolder = (platform: string, projectCode: string): string => {
    const folderPath = path.join('data', 'users', platform, projectCode);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const currentDomain = getCurrentDomain(request);
        const { sourceType, platform, projectCode, description } = body;

        // 参数验证
        if (!sourceType || !platform || !projectCode) {
            return NextResponse.json(
                { error: '缺少必要参数' },
                { status: 400 }
            );
        }

        // 获取平台缩写
        const platformData = await query(
            'SELECT abbreviation FROM platform WHERE platform = ? LIMIT 1',
            [platform]
        ) as any[];

        // 使用平台缩写，如果找不到则直接使用平台名称
        const platformAbbreviation = platformData && platformData.length > 0 
            ? platformData[0].abbreviation 
            : platform;

        // 获取来源类型的英文表示
        const sourceTypeData = await query(
            'SELECT en FROM sourcetype WHERE sourcetype = ? LIMIT 1',
            [sourceType]
        ) as any[];

        // 使用来源类型的英文表示，如果找不到则直接使用来源类型名称
        const sourceTypeEn = sourceTypeData && sourceTypeData.length > 0
            ? sourceTypeData[0].en
            : sourceType;

        const shortUrl = generateShortUrl(platform, projectCode, currentDomain);
        const longUrl = generateLongUrl(sourceTypeEn, platformAbbreviation, projectCode);

        // 使用当前时间
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 创建数据库记录 - 使用link_info表并明确指定created_at和description
        await query(
            `INSERT INTO link_info (
                source_type, platform, project_code, description, short_url, long_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sourceType, platform, projectCode, description || '', shortUrl, longUrl, currentTime]
        );

        // 获取最后插入的记录ID
        const [result] = await query('SELECT LAST_INSERT_ID() as id') as any[];
        const insertId = result.id;

        // 返回完整的新记录对象
        return NextResponse.json({
            id: insertId,
            createdAt: currentTime,
            sourceType,
            platform,
            projectCode,
            description: description || '',
            shortUrl,
            longUrl
        });
    } catch (error) {
        console.error('生成链接失败:', error);
        return NextResponse.json(
            { error: '生成链接失败' },
            { status: 500 }
        );
    }
}