"use client";

import React, { useState } from 'react';
import axios from 'axios';

// 平台类型定义
type PlatformInfo = {
    id: number;
    platform: string;
    abbreviation: string;
};

// 组件属性定义
interface AddPlatformModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (platform: PlatformInfo) => void;
}

const AddPlatformModal: React.FC<AddPlatformModalProps> = ({ isOpen, onClose, onSuccess}) => {
    const [newPlatform, setNewPlatform] = useState<string>('');
    const [newAbbreviation, setNewAbbreviation] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // 重置表单
    const resetForm = () => {
        setNewPlatform('');
        setNewAbbreviation('');
        setError('');
    };

    // 处理关闭弹窗
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // 处理添加平台
    const handleAddPlatform = async () => {
        // 验证输入
        if (!newPlatform.trim() || !newAbbreviation.trim()) {
            setError('平台名称和缩写不能为空');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await axios.post<PlatformInfo>('/api/platforms', {
                platform: newPlatform,
                abbreviation: newAbbreviation
            });
            
            // 调用成功回调
            onSuccess(response.data);
            
            // 关闭弹窗
            handleClose();
        } catch (error: any) {
            console.error('添加平台失败:', error);
            // 获取详细错误信息
            setError(error.response?.data?.error || '添加平台失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative pointer-events-auto">
                <h3 className="text-xl font-bold mb-4">添加新平台</h3>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-1">平台名称 <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded-md"
                        disabled={loading}
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
                        disabled={loading}
                        required
                    />
                    <p className="text-gray-500 text-sm mt-1">缩写将用于生成短链接，建议使用英文字母</p>
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleClose}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleAddPlatform}
                        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '添加中...' : '添加'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPlatformModal; 