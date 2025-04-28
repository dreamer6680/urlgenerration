'use client';

import { useState } from 'react';
import axios from 'axios';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectCode: string) => void;
}

export default function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [projectCode, setProjectCode] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [workflowJson, setWorkflowJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 清除表单数据
  const resetForm = () => {
    setProjectCode('');
    setWorkflowJson('');
    setError('');
  };

  // 处理关闭弹窗
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 提交新项目
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 验证JSON格式
      let workflowData = null;
      if (workflowJson.trim()) {
        try {
          workflowData = JSON.parse(workflowJson);
        } catch (e) {
          throw new Error('Workflow必须是有效的JSON格式');
        }
      }

      // 发送请求创建新项目
      const response = await axios.post('/api/projects', {
        projectCode,
        projectDescription,
        workflow: workflowData
      });

      if (response.data.success) {
        resetForm();
        onSuccess(projectCode);
      } else {
        throw new Error(response.data.message || '创建项目失败');
      }
    } catch (error: any) {
      setError(error.message || '创建项目时出错');
      console.error('创建项目错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md pointer-events-auto">
        <h3 className="text-xl font-bold mb-4">添加新项目</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">项目代码 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">项目描述</label>
            <input
              type="text"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Workflow数据 (JSON格式)</label>
            <textarea
              value={workflowJson}
              onChange={(e) => setWorkflowJson(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md h-36 font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-gray-500 text-sm mt-1">请输入有效的JSON数据，将用于存储工作流程配置。如不需要可留空。</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>

    
  );
} 