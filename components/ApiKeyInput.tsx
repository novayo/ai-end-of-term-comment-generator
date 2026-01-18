import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, RefreshCw, Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
      onApiKeyChange(storedKey);
      setSaved(true);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setSaved(true);
      alert('API Key 已儲存！');
    } else {
      alert('請輸入 API Key！');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('geminiApiKey');
    setApiKey('');
    onApiKeyChange('');
    setSaved(false);
    alert('API Key 已重設！');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
        <Key className="w-5 h-5" />
        Gemini API Key 設定
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-stone-50 text-text-dark placeholder-stone-400"
            placeholder="請輸入 Gemini API Key"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap shadow-sm"
          >
            <Save size={18} />
            儲存
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-stone-400 text-white rounded-lg hover:bg-stone-500 transition-colors whitespace-nowrap shadow-sm"
          >
            <RefreshCw size={18} />
            重設
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;