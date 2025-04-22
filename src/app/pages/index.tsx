import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 定义链接信息的类型
type LinkInfo = {
    id: string;
    createdAt: string;
    sourceType: string;
    platform: string;
    projectCode: string;
    shortUrl: string;
    longUrl: string;
};

const HomePage: React.FC = () => {
    const [sourceType, setSourceType] = useState<string>('视频');
    const [platform, setPlatform] = useState<string>('B站');
    const [projectCode, setProjectCode] = useState<string>('');
    const [links, setLinks] = useState<LinkInfo[]>([]);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await axios.get<LinkInfo[]>('/api/links');
                setLinks(response.data);
            } catch (error) {
                console.error('Error fetching links:', error);
            }
        };
        fetchLinks();
    }, []);

    const handleGenerateLink = async () => {
        try {
            const response = await axios.post<LinkInfo>('/api/generate', {
                sourceType,
                platform,
                projectCode,
            });
            setLinks([...links, response.data]);
        } catch (error) {
            console.error('Error generating link:', error);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">FastGPT 营销链接生成器</h1>
            <div className="mb-4">
                <label className="block mb-1">来源类型</label>
                <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded-md"
                >
                    <option value="视频">视频</option>
                    <option value="内容">内容</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">发布平台</label>
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded-md"
                >
                    <option value="B站">B站</option>
                    <option value="小红书">小红书</option>
                    <option value="抖音">抖音</option>
                    <option value="公众号">公众号</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">内容代号</label>
                <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded-md"
                />
            </div>

            <button
                onClick={handleGenerateLink}
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
            >
                生成链接
            </button>
            <h2 className="text-2xl font-bold mt-8 mb-4">链接管理列表</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">创建时间</th>
                        <th className="border border-gray-300 p-2">来源类型</th>
                        <th className="border border-gray-300 p-2">发布平台</th>
                        <th className="border border-gray-300 p-2">项目代号</th>
                        <th className="border border-gray-300 p-2">短链接</th>
                        <th className="border border-gray-300 p-2">长链接</th>
                        <th className="border border-gray-300 p-2">数据存储路径</th>
                    </tr>
                </thead>
                <tbody>
                    {links.map((link) => (
                        <tr key={link.id}>
                            <td className="border border-gray-300 p-2">{link.createdAt}</td>
                            <td className="border border-gray-300 p-2">{link.sourceType}</td>
                            <td className="border border-gray-300 p-2">{link.platform}</td>
                            <td className="border border-gray-300 p-2">{link.projectCode}</td>
                            <td className="border border-gray-300 p-2">
                                <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                                    {link.shortUrl}
                                </a>
                            </td>
                            <td className="border border-gray-300 p-2">
                                <a href={link.longUrl} target="_blank" rel="noopener noreferrer">
                                    {link.longUrl}
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HomePage;
    