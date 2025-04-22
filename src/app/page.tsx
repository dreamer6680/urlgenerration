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

const HomePage: React.FC = () => {
    const [sourceType, setSourceType] = useState<string>('');
    const [platform, setPlatform] = useState<string>('');
    const [projectCode, setProjectCode] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [links, setLinks] = useState<LinkInfo[]>([]);
    const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
    const [sourceTypes, setSourceTypes] = useState<SourceTypeInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    // 平台相关状态
    const [showAddPlatform, setShowAddPlatform] = useState<boolean>(false);
    const [newPlatform, setNewPlatform] = useState<string>('');
    const [newAbbreviation, setNewAbbreviation] = useState<string>('');
    const [addingPlatform, setAddingPlatform] = useState<boolean>(false);
    const [addPlatformError, setAddPlatformError] = useState<string>('');
    
    // 来源类型相关状态
    const [showAddSourceType, setShowAddSourceType] = useState<boolean>(false);
    const [newSourceType, setNewSourceType] = useState<string>('');
    const [newSourceTypeEn, setNewSourceTypeEn] = useState<string>('');
    const [addingSourceType, setAddingSourceType] = useState<boolean>(false);
    const [addSourceTypeError, setAddSourceTypeError] = useState<string>('');

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

    // 在文件开头声明状态
    const [isComposing, setIsComposing] = useState<boolean>(false);

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

    // 获取链接列表
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                setLoading(true);
                const response = await axios.get<LinkInfo[]>('/api/links');
                setLinks(response.data);
                setError('');
            } catch (error) {
                console.error('获取链接失败:', error);
                setError('获取链接失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        };
        fetchLinks();
    }, []);

    // 获取平台列表
    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const response = await axios.get<PlatformInfo[]>('/api/platforms');
                setPlatforms(response.data);
                // 如果有平台数据，默认选择第一个
                if (response.data.length > 0) {
                    setPlatform(response.data[0].platform);
                }
            } catch (error) {
                console.error('获取平台列表失败:', error);
                setError('获取平台列表失败');
            }
        };
        fetchPlatforms();
    }, []);

    // 获取来源类型列表
    useEffect(() => {
        const fetchSourceTypes = async () => {
            try {
                const response = await axios.get<SourceTypeInfo[]>('/api/sourcetypes');
                setSourceTypes(response.data);
                // 如果有来源类型数据，默认选择第一个
                if (response.data.length > 0) {
                    setSourceType(response.data[0].sourcetype);
                }
            } catch (error) {
                console.error('获取来源类型列表失败:', error);
                setError('获取来源类型列表失败');
            }
        };
        fetchSourceTypes();
    }, []);

    const handleGenerateLink = async () => {
        if (!projectCode) {
            setError('请输入内容代号');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await axios.post<LinkInfo>('/api/generate', {
                sourceType,
                platform,
                projectCode,
                description
            });
            setLinks(prev => [response.data, ...prev]);
            // 清空表单
            setProjectCode('');
            setDescription('');
        } catch (error) {
            console.error('生成链接失败:', error);
            setError('生成链接失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlatform = async () => {
        // 验证输入
        if (!newPlatform.trim() || !newAbbreviation.trim()) {
            setAddPlatformError('平台名称和缩写不能为空');
            return;
        }

        try {
            setAddingPlatform(true);
            setAddPlatformError('');
            
            const response = await axios.post<PlatformInfo>('/api/platforms', {
                platform: newPlatform,
                abbreviation: newAbbreviation
            });
            
            // 更新平台列表
            setPlatforms(prev => [...prev, response.data]);
            
            // 重置表单并关闭弹窗
            setNewPlatform('');
            setNewAbbreviation('');
            setShowAddPlatform(false);
        } catch (error: any) {
            console.error('添加平台失败:', error);
            // 获取详细错误信息
            setAddPlatformError(error.response?.data?.error || '添加平台失败，请稍后重试');
        } finally {
            setAddingPlatform(false);
        }
    };

    const handleAddSourceType = async () => {
        // 验证输入
        if (!newSourceType.trim() || !newSourceTypeEn.trim()) {
            setAddSourceTypeError('类型名称和英文不能为空');
            return;
        }

        try {
            setAddingSourceType(true);
            setAddSourceTypeError('');
            
            const response = await axios.post<SourceTypeInfo>('/api/sourcetypes', {
                sourcetype: newSourceType,
                en: newSourceTypeEn
            });
            
            // 更新来源类型列表
            setSourceTypes(prev => [...prev, response.data]);
            
            // 重置表单并关闭弹窗
            setNewSourceType('');
            setNewSourceTypeEn('');
            setShowAddSourceType(false);
        } catch (error: any) {
            console.error('添加来源类型失败:', error);
            // 获取详细错误信息
            setAddSourceTypeError(error.response?.data?.error || '添加来源类型失败，请稍后重试');
        } finally {
            setAddingSourceType(false);
        }
    };

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
            
            // 筛选项目代号
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
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-4">FastGPT 营销链接生成器</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <div className="mb-4">
                <label className="block mb-1">来源类型</label>
                <div className="flex gap-2">
                <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                        className="border border-gray-300 p-2 flex-grow rounded-md"
                        disabled={loading}
                    >
                        {sourceTypes.length === 0 ? (
                            <option value="">暂无来源类型数据</option>
                        ) : (
                            sourceTypes.map(st => (
                                <option key={st.id} value={st.sourcetype}>{st.sourcetype} ({st.en})</option>
                            ))
                        )}
                </select>
                    <button
                        onClick={() => setShowAddSourceType(true)}
                        className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
                        type="button"
                    >
                        添加类型
                    </button>
                </div>
            </div>
            <div className="mb-4">
                <label className="block mb-1">发布平台</label>
                <div className="flex gap-2">
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                        className="border border-gray-300 p-2 flex-grow rounded-md"
                        disabled={loading}
                    >
                        {platforms.length === 0 ? (
                            <option value="">暂无平台数据</option>
                        ) : (
                            platforms.map(p => (
                                <option key={p.id} value={p.platform}>{p.platform} ({p.abbreviation})</option>
                            ))
                        )}
                </select>
                    <button
                        onClick={() => setShowAddPlatform(true)}
                        className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
                        type="button"
                    >
                        添加平台
                    </button>
                </div>
            </div>
            <div className="mb-4">
                <label className="block mb-1">内容代号 <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded-md"
                    disabled={loading}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1">中文描述 <span className="text-gray-500">(可选)</span></label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简短描述链接用途，便于后续筛选和识别"
                    className="border border-gray-300 p-2 w-full rounded-md"
                    disabled={loading}
                />
            </div>
            <button
                onClick={handleGenerateLink}
                className={`bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
            >
                {loading ? '处理中...' : '生成链接'}
            </button>
            <h2 className="text-2xl font-bold mt-8 mb-4">链接管理列表</h2>
            
            {/* 筛选状态指示器和清除按钮 */}
            {isFiltering && (
                <div className="flex items-center mb-4 bg-blue-50 p-2 rounded">
                    <div className="flex-grow">
                        <span className="font-medium">已筛选: </span>
                        {filters.sourceType && <span className="mr-2">来源类型: {filters.sourceType}</span>}
                        {filters.platform && <span className="mr-2">发布平台: {filters.platform}</span>}
                        {filters.projectCode && <span className="mr-2">项目代号包含: {filters.projectCode}</span>}
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
                                        项目代号
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    
                                    {/* 项目代号筛选输入框 */}
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
                                                placeholder="搜索项目代号..."
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
                                            {link.longUrl.substring(0, 100)}...
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                </div>
            )}

            {/* 添加平台弹窗 */}
            {showAddPlatform && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md pointer-events-auto">
                        <h3 className="text-xl font-bold mb-4">添加新平台</h3>
                        {addPlatformError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {addPlatformError}
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block mb-1">平台名称 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={newPlatform}
                                onChange={(e) => setNewPlatform(e.target.value)}
                                className="border border-gray-300 p-2 w-full rounded-md"
                                disabled={addingPlatform}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">平台缩写 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={newAbbreviation}
                                onChange={(e) => setNewAbbreviation(e.target.value)}
                                className="border border-gray-300 p-2 w-full rounded-md"
                                disabled={addingPlatform}
                                required
                            />
                            <p className="text-gray-500 text-sm mt-1">缩写将用于生成短链接，建议使用英文字母</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowAddPlatform(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                                disabled={addingPlatform}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddPlatform}
                                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${addingPlatform ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={addingPlatform}
                            >
                                {addingPlatform ? '添加中...' : '添加'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 添加来源类型弹窗 */}
            {showAddSourceType && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md pointer-events-auto">
                        <h3 className="text-xl font-bold mb-4">添加新来源类型</h3>
                        {addSourceTypeError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {addSourceTypeError}
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block mb-1">类型名称 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={newSourceType}
                                onChange={(e) => setNewSourceType(e.target.value)}
                                className="border border-gray-300 p-2 w-full rounded-md"
                                disabled={addingSourceType}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">英文标识 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={newSourceTypeEn}
                                onChange={(e) => setNewSourceTypeEn(e.target.value)}
                                className="border border-gray-300 p-2 w-full rounded-md"
                                disabled={addingSourceType}
                                required
                            />
                            <p className="text-gray-500 text-sm mt-1">英文标识将用于生成长链接中的参数，建议使用小写字母</p>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowAddSourceType(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                                disabled={addingSourceType}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddSourceType}
                                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${addingSourceType ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={addingSourceType}
                            >
                                {addingSourceType ? '添加中...' : '添加'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
    