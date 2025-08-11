"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProjectModal from './components/AddProjectModal';
import AddPlatformModal from './components/AddPlatformModal';
import AddSourceTypeModal from './components/AddSourceTypeModal';
import LinkManagementList from './components/LinkManagementList';

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

interface Project {
    id: number;
    project_code: string;
    url: string;
}

const HomePage: React.FC = () => {
    const [sourceType, setSourceType] = useState<string>('');
    const [platform, setPlatform] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
    const [sourceTypes, setSourceTypes] = useState<SourceTypeInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [updatalist, setUpdatelist] = useState<boolean>(false);
    
    // 添加缺失的状态变量
    const [qrVisible, setQrVisible] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [generatedLink, setGeneratedLink] = useState<string>('');
    const [qrValue, setQrValue] = useState<string>('');
    
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

    // 在组件加载时加载项目列表
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');

    useEffect(() => {
        fetchProjects();
    }, []);

    // 获取项目列表
    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects');
            if (response.data.success) {
                setProjects(response.data.projects);
            }
        } catch (error) {
            console.error('获取项目列表失败:', error);
        }
    };

    // 项目创建成功回调
    const handleProjectCreated = (projectCode: string) => {
        setShowAddProjectModal(false);
        fetchProjects();
        setSelectedProject(projectCode);
    };

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

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setQrVisible(false);
        setSuccessMessage('');
        
        // 验证项目选择
        if (!selectedProject) {
            setError('请先选择或创建项目');
            return;
        }

        try {
            if (!platform || !selectedProject) {
                console.log(platform,selectedProject)
                setError('请填写所有必填字段');
                return;
            }

            // 查找选定项目的workflow URL
            const project = projects.find(p => p.project_code === selectedProject);
            if (!project) {
                setError('找不到所选项目');
                return;
            }

            setLoading(true);
            setError('');
            const response = await axios.post<LinkInfo>('/api/generate', {
                sourceType,
                platform,
                projectCode: selectedProject,
                workflow_url: project.url
            });
            

            
            // 显示成功消息和生成的短链接
            setGeneratedLink(response.data.shortUrl);
            setQrValue(response.data.shortUrl);
            setSuccessMessage('短链接生成成功!');
            setUpdatelist(true);
            
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

    // 处理平台添加成功回调
    const handlePlatformCreated = (platform: PlatformInfo) => {
        setShowAddPlatform(false);
        setPlatforms(prev => [...prev, platform]);
        setPlatform(platform.platform); // 自动选择新添加的平台
    };

    // 处理来源类型添加成功回调
    const handleSourceTypeCreated = (sourceType: SourceTypeInfo) => {
        setShowAddSourceType(false);
        setSourceTypes(prev => [...prev, sourceType]);
        setSourceType(sourceType.sourcetype); // 自动选择新添加的来源类型
    };

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">FastGPT 营销链接生成器</h1>
            </div>
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
            {/* 添加项目选择和创建项目按钮 */}
            <div className="mb-4">
                <label className="block mb-1">项目代号</label>
                <div className="flex gap-2">
                <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                        className="border border-gray-300 p-2 flex-grow rounded-md"
                        disabled={loading}
                    >
                        {projects.length === 0 ? (
                            <option value="">暂无项目数据</option>
                        ) : (
                            <>
                                <option value="">请选择项目代号</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.project_code}>
                                        {project.project_code}
                                    </option>
                                ))}
                            </>
                        )}
                </select>
                    <button
                        type="button"
                        onClick={() => setShowAddProjectModal(true)}
                        className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                        添加新项目
                    </button>
                </div>
            </div>
            <button
                onClick={handleGenerate}
                className={`bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
            >
                {loading ? '处理中...' : '生成链接'}
            </button>
            
            {successMessage && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <div className="flex justify-between items-center">
                        <p>{successMessage}</p>
                        <button 
                            onClick={() => setSuccessMessage('')}
                            className="text-green-700"
                        >
                            ×
                        </button>
                    </div>
                    <p className="mt-2">
                        生成的短链接: <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{generatedLink}</a>
                    </p>
                </div>
            )}
            
            {/* 使用链接管理列表组件，不再传递initialLinks */}
            <div>
                <LinkManagementList 
                    updatalist={updatalist}
                />
            </div>

            {/* 添加平台弹窗 */}
            <AddPlatformModal 
                isOpen={showAddPlatform}
                onClose={() => setShowAddPlatform(false)}
                onSuccess={handlePlatformCreated}
            />

            {/* 添加来源类型弹窗 */}
            <AddSourceTypeModal 
                isOpen={showAddSourceType}
                onClose={() => setShowAddSourceType(false)}
                onSuccess={handleSourceTypeCreated}
            />

            {/* 新项目弹窗 */}
            <AddProjectModal 
                isOpen={showAddProjectModal}
                onClose={() => setShowAddProjectModal(false)}
                onSuccess={handleProjectCreated}
            />
        </div>
    );
};

export default HomePage;
    