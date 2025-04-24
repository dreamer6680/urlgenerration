"use client";

import React, { useState } from 'react';
import axios from 'axios';

// 来源类型定义
type SourceTypeInfo = {
    id: number;
    sourcetype: string;
    en: string;
};

// 组件属性定义
interface AddSourceTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (sourceType: SourceTypeInfo) => void;
}

const AddSourceTypeModal: React.FC<AddSourceTypeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [newSourceType, setNewSourceType] = useState<string>('');
    const [newSourceTypeEn, setNewSourceTypeEn] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // 重置表单
    const resetForm = () => {
        setNewSourceType('');
        setNewSourceTypeEn('');
        setError('');
    };

    // 处理关闭弹窗
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // 处理添加来源类型
    const handleAddSourceType = async () => {
        // 验证输入
        if (!newSourceType.trim() || !newSourceTypeEn.trim()) {
            setError('类型名称和英文标识不能为空');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await axios.post<SourceTypeInfo>('/api/sourcetypes', {
                sourcetype: newSourceType,
                en: newSourceTypeEn
            });
            
            // 调用成功回调
            onSuccess(response.data);
            
            // 关闭弹窗
            handleClose();
        } catch (error: any) {
            console.error('添加来源类型失败:', error);
            // 获取详细错误信息
            setError(error.response?.data?.error || '添加来源类型失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative pointer-events-auto">
                <h3 className="text-xl font-bold mb-4">添加新来源类型</h3>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-1">类型名称 <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={newSourceType}
                        onChange={(e) => setNewSourceType(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded-md"
                        disabled={loading}
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
                        disabled={loading}
                        required
                    />
                    <p className="text-gray-500 text-sm mt-1">英文标识将用于生成长链接中的参数，建议使用小写字母</p>
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
                        onClick={handleAddSourceType}
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

export default AddSourceTypeModal; 