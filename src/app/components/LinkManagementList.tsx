"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// 定义链接信息的类型
type LinkInfo = {
    id: number;
    createdAt: string;
    sourceType: string;
    platform: string;
    projectCode: string;
    description: string;
    shortUrl: string;
    longUrl: string;
};

// 定义平台信息的类型
type PlatformInfo = {
    id: number;
    platform: string;
    abbreviation: string;
};

// 定义来源类型的类型
type SourceTypeInfo = {
    id: number;
    sourcetype: string;
    en: string;
};

// 定义筛选状态类型
type FilterState = {
    sourceType: string | null;
    platform: string | null;
    projectCode: string | null;
    description: string | null;
};

interface LinkManagementListProps {
    // 移除initialLinks和onRefresh参数，组件自行完成数据获取和刷新
    updatalist: boolean;
}

const LinkManagementList: React.FC<LinkManagementListProps> = ({ updatalist }) => {
    const [links, setLinks] = useState<LinkInfo[]>([]);
    const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
    const [sourceTypes, setSourceTypes] = useState<SourceTypeInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // 筛选相关状态
    const [filters, setFilters] = useState<FilterState>({
        sourceType: null,
        platform: null,
        projectCode: null,
        description: null
    });
    const [showSourceTypeFilter, setShowSourceTypeFilter] = useState<boolean>(false);
    const [showPlatformFilter, setShowPlatformFilter] = useState<boolean>(false);
    const [showProjectCodeFilter, setShowProjectCodeFilter] = useState<boolean>(false);
    const [showDescriptionFilter, setShowDescriptionFilter] = useState<boolean>(false);
    const [projectCodeFilter, setProjectCodeFilter] = useState<string>('');
    const [descriptionFilter, setDescriptionFilter] = useState<string>('');
    
    // 引用筛选下拉菜单的DOM元素，用于点击外部关闭
    const sourceTypeFilterRef = useRef<HTMLDivElement>(null);
    const platformFilterRef = useRef<HTMLDivElement>(null);
    const projectCodeFilterRef = useRef<HTMLDivElement>(null);
    const descriptionFilterRef = useRef<HTMLDivElement>(null);

    // 中文输入法状态
    const [isComposing, setIsComposing] = useState<boolean>(false);

    // 获取链接列表
    const fetchLinks = async () => {
        try {
            setLoading(true);
            const response = await axios.get<LinkInfo[]>('/api/linkmanagelists');
            setLinks(response.data);
            setError('');
        } catch (error) {
            console.error('获取链接失败:', error);
            setError('获取链接失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 获取平台列表
    const fetchPlatforms = async () => {
        try {
            const response = await axios.get<PlatformInfo[]>('/api/platforms');
            setPlatforms(response.data);
        } catch (error) {
            console.error('获取平台列表失败:', error);
        }
    };

    // 获取来源类型列表
    const fetchSourceTypes = async () => {
        try {
            const response = await axios.get<SourceTypeInfo[]>('/api/sourcetypes');
            setSourceTypes(response.data);
        } catch (error) {
            console.error('获取来源类型列表失败:', error);
        }
    };

    useEffect(() => {
        fetchLinks();
        fetchPlatforms();
        fetchSourceTypes();
    }, [updatalist]);

    // 点击外部关闭筛选下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sourceTypeFilterRef.current && !sourceTypeFilterRef.current.contains(event.target as Node)) {
                setShowSourceTypeFilter(false);
            }
            if (platformFilterRef.current && !platformFilterRef.current.contains(event.target as Node)) {
                setShowPlatformFilter(false);
            }
            if (projectCodeFilterRef.current && !projectCodeFilterRef.current.contains(event.target as Node)) {
                setShowProjectCodeFilter(false);
            }
            if (descriptionFilterRef.current && !descriptionFilterRef.current.contains(event.target as Node)) {
                setShowDescriptionFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 处理筛选状态变化
    const handleFilterChange = (type: keyof FilterState, value: string | null) => {
        setFilters(prev => ({
            ...prev,
            [type]: value
        }));
    };

    // 清除所有筛选
    const clearAllFilters = () => {
        setFilters({
            sourceType: null,
            platform: null,
            projectCode: null,
            description: null
        });
        setProjectCodeFilter('');
        setDescriptionFilter('');
    };

    // 应用筛选逻辑获取筛选后的链接数据
    const getFilteredLinks = () => {
        return links.filter(link => {
            // 筛选来源类型
            if (filters.sourceType && link.sourceType !== filters.sourceType) {
                return false;
            }
            
            // 筛选发布平台
            if (filters.platform && link.platform !== filters.platform) {
                return false;
            }
            
            // 筛选工作流详情
            if (filters.projectCode && !link.projectCode.toLowerCase().includes(filters.projectCode.toLowerCase())) {
                return false;
            }
            
            // 筛选中文描述
            if (filters.description) {
                // 如果设置了描述筛选但链接没有描述，不显示该链接
                if (!link.description) {
                    return false;
                }
                // 如果链接有描述但不包含筛选文本，不显示该链接
                if (!link.description.toLowerCase().includes(filters.description.toLowerCase())) {
                    return false;
                }
            }
            
            return true;
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    };

    const filteredLinks = getFilteredLinks();
    const isFiltering = filters.sourceType !== null || filters.platform !== null || filters.projectCode !== null || filters.description !== null;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">链接管理列表</h2>
                <button 
                    onClick={fetchLinks}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                    刷新列表
                </button>
            </div>
            
            {/* 筛选状态指示器和清除按钮 */}
            {isFiltering && (
                <div className="flex items-center mb-4 bg-blue-50 p-2 rounded">
                    <div className="flex-grow">
                        <span className="font-medium">已筛选: </span>
                        {filters.sourceType && <span className="mr-2">来源类型: {filters.sourceType}</span>}
                        {filters.platform && <span className="mr-2">发布平台: {filters.platform}</span>}
                        {filters.projectCode && <span className="mr-2">工作流详情包含: {filters.projectCode}</span>}
                        {filters.description && <span className="mr-2">描述包含: {filters.description}</span>}
                    </div>
                    <button 
                        onClick={clearAllFilters}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        清除筛选
                    </button>
                </div>
            )}
            
            {loading && links.length === 0 ? (
                <div className="text-center py-4">加载中...</div>
            ) : links.length === 0 ? (
                <div className="min-h-[300px] text-center py-4">暂无链接数据</div>
            ) : filteredLinks.length === 0 ? (
                <div className="min-h-[300px] text-center py-4">没有符合筛选条件的数据</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-h-[300px]">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2 min-w-[120px]">创建时间</th>
                                <th className="border border-gray-300 p-2 relative min-w-[120px]">
                                    <div 
                                        onClick={() => setShowSourceTypeFilter(!showSourceTypeFilter)}
                                        className="cursor-pointer flex items-center justify-center"
                                    >
                                        来源类型
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    
                                    {/* 来源类型筛选下拉菜单 */}
                                    {showSourceTypeFilter && (
                                        <div 
                                            ref={sourceTypeFilterRef}
                                            className="absolute z-10 top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 p-2"
                                        >
                                            <div 
                                                className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${filters.sourceType === null ? 'bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    handleFilterChange('sourceType', null);
                                                    setShowSourceTypeFilter(false);
                                                }}
                                            >
                                                全部
                                            </div>
                                            {sourceTypes.length === 0 ? (
                                                <div className="p-2 text-gray-500">暂无类型数据</div>
                                            ) : (
                                                sourceTypes.map(st => (
                                                    <div 
                                                        key={st.id} 
                                                        className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${filters.sourceType === st.sourcetype ? 'bg-blue-50' : ''}`}
                                                        onClick={() => {
                                                            handleFilterChange('sourceType', st.sourcetype);
                                                            setShowSourceTypeFilter(false);
                                                        }}
                                                    >
                                                        {st.sourcetype}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </th>
                                <th className="border border-gray-300 p-2 relative min-w-[120px]">
                                    <div 
                                        onClick={() => setShowPlatformFilter(!showPlatformFilter)}
                                        className="cursor-pointer flex items-center justify-center"
                                    >
                                        发布平台
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    
                                    {/* 发布平台筛选下拉菜单 */}
                                    {showPlatformFilter && (
                                        <div 
                                            ref={platformFilterRef}
                                            className="absolute z-10 top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 p-2"
                                        >
                                            <div 
                                                className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${filters.platform === null ? 'bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    handleFilterChange('platform', null);
                                                    setShowPlatformFilter(false);
                                                }}
                                            >
                                                全部
                                            </div>
                                            {platforms.length === 0 ? (
                                                <div className="p-2 text-gray-500">暂无平台数据</div>
                                            ) : (
                                                platforms.map(p => (
                                                    <div 
                                                        key={p.id} 
                                                        className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${filters.platform === p.platform ? 'bg-blue-50' : ''}`}
                                                        onClick={() => {
                                                            handleFilterChange('platform', p.platform);
                                                            setShowPlatformFilter(false);
                                                        }}
                                                    >
                                                        {p.platform}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </th>
                                <th className="border border-gray-300 p-2 relative min-w-[120px]">
                                    <div 
                                        onClick={() => setShowProjectCodeFilter(!showProjectCodeFilter)}
                                        className="cursor-pointer flex items-center justify-center"
                                    >
                                        工作流详情
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    
                                    {/* 工作流详情筛选输入框 */}
                                    {showProjectCodeFilter && (
                                        <div 
                                            ref={projectCodeFilterRef}
                                            className="absolute z-10 top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 p-2"
                                        >
                                            <input
                                                type="text"
                                                value={projectCodeFilter}
                                                onChange={(e) => {
                                                    setProjectCodeFilter(e.target.value);
                                                    // 只有在不是中文输入法组合状态时才应用筛选
                                                    if (!isComposing) {
                                                        handleFilterChange('projectCode', e.target.value || null);
                                                    }
                                                }}
                                                onCompositionStart={() => setIsComposing(true)}
                                                onCompositionEnd={(e) => {
                                                    setIsComposing(false);
                                                    // 在中文输入完成后应用筛选
                                                    handleFilterChange('projectCode', (e.target as HTMLInputElement).value || null);
                                                }}
                                                placeholder="搜索工作流详情..."
                                                className="border border-gray-300 p-2 w-full rounded-md mb-2"
                                                autoFocus
                                            />
                                            <div 
                                                className="p-2 hover:bg-gray-100 cursor-pointer rounded text-center text-blue-500"
                                                onClick={() => {
                                                    setProjectCodeFilter('');
                                                    handleFilterChange('projectCode', null);
                                                    setShowProjectCodeFilter(false);
                                                }}
                                            >
                                                清除搜索
                                            </div>
                                        </div>
                                    )}
                                </th>
                                <th className="border border-gray-300 p-2 relative min-w-[120px]">
                                    <div 
                                        onClick={() => setShowDescriptionFilter(!showDescriptionFilter)}
                                        className="cursor-pointer flex items-center justify-center"
                                    >
                                        中文描述
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    
                                    {/* 中文描述筛选输入框 */}
                                    {showDescriptionFilter && (
                                        <div 
                                            ref={descriptionFilterRef}
                                            className="absolute z-10 top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 p-2"
                                        >
                                            <input
                                                type="text"
                                                value={descriptionFilter}
                                                onChange={(e) => {
                                                    setDescriptionFilter(e.target.value);
                                                    // 只有在不是中文输入法组合状态时才应用筛选
                                                    if (!isComposing) {
                                                        handleFilterChange('description', e.target.value || null);
                                                    }
                                                }}
                                                onCompositionStart={() => setIsComposing(true)}
                                                onCompositionEnd={(e) => {
                                                    setIsComposing(false);
                                                    // 在中文输入完成后应用筛选
                                                    handleFilterChange('description', (e.target as HTMLInputElement).value || null);
                                                }}
                                                placeholder="搜索描述内容..."
                                                className="border border-gray-300 p-2 w-full rounded-md mb-2"
                                                autoFocus
                                            />
                                            <div 
                                                className="p-2 hover:bg-gray-100 cursor-pointer rounded text-center text-blue-500"
                                                onClick={() => {
                                                    setDescriptionFilter('');
                                                    handleFilterChange('description', null);
                                                    setShowDescriptionFilter(false);
                                                }}
                                            >
                                                清除搜索
                                            </div>
                                        </div>
                                    )}
                                </th>
                                <th className="border border-gray-300 p-2 min-w-[120px]">短链接</th>
                                <th className="border border-gray-300 p-2 min-w-[120px]">长链接</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLinks.map((link) => (
                                <tr key={link.id}>
                                    <td className="border border-gray-300 p-2">{formatDate(link.createdAt)}</td>
                                    <td className="border border-gray-300 p-2">{link.sourceType}</td>
                                    <td className="border border-gray-300 p-2">{link.platform}</td>
                                    <td className="border border-gray-300 p-2">{link.projectCode}</td>
                                    <td className="border border-gray-300 p-2">
                                        {link.description || <span className="text-gray-400">无描述</span>}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {link.shortUrl}
                                        </a>
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <a href={link.longUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {link.longUrl}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LinkManagementList;