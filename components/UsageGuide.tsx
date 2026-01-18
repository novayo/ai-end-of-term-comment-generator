import React from 'react';
import { X, Eye, Copy, Wand2, Key, ExternalLink } from 'lucide-react';

interface UsageGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsageGuide: React.FC<UsageGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-down flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-primary">🚀 使用方法</h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors bg-stone-100 p-1.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 text-stone-600">
          
          {/* Method 1 */}
          <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
            <h3 className="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
              <span className="bg-stone-200 text-stone-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              手動複製提示詞 (無需 API Key)
            </h3>
            <p className="text-sm text-stone-500 mb-4 ml-8">
              如果您沒有 Gemini API Key，或想使用 ChatGPT / Claude 等其他 AI 模型：
            </p>
            <ul className="space-y-3 ml-8">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-stone-400">1.</span>
                <span>輸入學生姓名並選取該學生。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-stone-400">2.</span>
                <span>點選學生的特質標籤與希望的評語風格。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-stone-400">3.</span>
                <span className="flex items-center gap-1">
                  點擊 <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-stone-300 rounded text-xs text-stone-600"><Eye size={12}/> 產生提示詞</span> 按鈕。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-stone-400">4.</span>
                <span className="flex items-center gap-1">
                  點擊 <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-white rounded text-xs"><Copy size={12}/> 複製文字</span>，將提示詞貼上至 AI 聊天室。
                </span>
              </li>
            </ul>
          </div>

          {/* Method 2 */}
          <div className="bg-primary/5 rounded-lg p-5 border border-primary/20">
            <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              API 自動生成 (推薦)
            </h3>
            <p className="text-sm text-stone-500 mb-4 ml-8">
              直接在應用程式內完成所有動作：
            </p>
            <ul className="space-y-3 ml-8">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary/60">1.</span>
                <span className="flex items-center gap-1 flex-wrap">
                  在欄位中輸入您的 <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-stone-300 rounded text-xs text-stone-600"><Key size={12}/> Google Gemini API Key</span> (以 AIza 開頭)。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary/60">2.</span>
                <span>選取學生、特質與風格。</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary/60">3.</span>
                <span className="flex items-center gap-1">
                  點擊 <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded text-xs"><Wand2 size={12}/> 生成評語</span> 按鈕。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary/60">4.</span>
                <span>AI 將自動生成評語並顯示於文字框內。</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-4 border-t border-stone-100">
             <a 
               href="https://github.com/novayo/ai-end-of-term-comment-generator" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-stone-400 hover:text-primary transition-colors text-sm"
             >
               <ExternalLink size={14} />
               前往 GitHub 查看專案詳情
             </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UsageGuide;
