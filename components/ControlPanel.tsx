import React, { useState, useEffect } from 'react';
import { Palette, Ruler, Wand2, Eye, Sparkles, Copy, Check, Plus, X, Trash2, Key, EyeOff, AlertCircle } from 'lucide-react';
import { STYLE_DATA, WORD_LIMITS } from '../constants';

interface ControlPanelProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  selectedStyles: Set<string>;
  onToggleStyle: (style: string) => void;
  wordLimit: number;
  onSetWordLimit: (limit: number) => void;
  onGenerate: () => void;
  onShowPrompt: () => void;
  isGenerating: boolean;
  previewText: string;
  onTextChange: (text: string) => void;
  studentName: string | null;
  isShowingPrompt: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  apiKey,
  onApiKeyChange,
  selectedStyles,
  onToggleStyle,
  wordLimit,
  onSetWordLimit,
  onGenerate,
  onShowPrompt,
  isGenerating,
  previewText,
  onTextChange,
  studentName,
  isShowingPrompt
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Custom Styles State
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const [customStyleInput, setCustomStyleInput] = useState('');
  const [isStyleDeleteMode, setIsStyleDeleteMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('customStyles');
    if (saved) {
      setCustomStyles(JSON.parse(saved));
    }
  }, []);

  const handleAddCustomStyle = () => {
    const style = customStyleInput.trim();
    if (style) {
      if (!customStyles.includes(style)) {
        const newStyles = [...customStyles, style];
        setCustomStyles(newStyles);
        localStorage.setItem('customStyles', JSON.stringify(newStyles));
        setCustomStyleInput('');
      } else {
        setCustomStyleInput('');
      }
    }
  };

  const handleKeyPressStyle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomStyle();
    }
  };

  const handleDeleteCustomStyle = (style: string) => {
    const newStyles = customStyles.filter(s => s !== style);
    setCustomStyles(newStyles);
    localStorage.setItem('customStyles', JSON.stringify(newStyles));
    
    // If selected, deselect it by toggling
    if (selectedStyles.has(style)) {
      onToggleStyle(style);
    }

    if (newStyles.length === 0) setIsStyleDeleteMode(false);
  };

  const toggleStyleDeleteMode = () => {
    if (customStyles.length === 0 && !isStyleDeleteMode) return;
    setIsStyleDeleteMode(!isStyleDeleteMode);
  };

  const handleCopy = async () => {
    if (!previewText) return;
    try {
      await navigator.clipboard.writeText(previewText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Google API Key Validation
  // Starts with AIza, followed by 35 alphanumeric characters (including - and _)
  const isValidApiKey = (key: string) => {
    if (!key) return false;
    return /^AIza[0-9A-Za-z\-_]{35}$/.test(key);
  };

  const hasValidApiKey = isValidApiKey(apiKey);
  // Check if user has entered something but it's invalid
  const isInvalidFormat = apiKey.length > 0 && !hasValidApiKey;

  return (
    <>
      {/* Styles */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Palette className="w-5 h-5" />
            評語風格
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLE_DATA.map(style => {
            const isSelected = selectedStyles.has(style.name);
            return (
              <div key={style.name} className="relative group">
                <button
                  onClick={() => onToggleStyle(style.name)}
                  className={`
                    px-4 py-2 rounded text-sm transition-all border
                    ${isSelected 
                      ? 'bg-selected text-primary font-bold border-selected shadow-sm' 
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-selected'
                    }
                  `}
                >
                  {style.name}
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-text-dark text-white text-xs rounded z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  <p className="font-bold mb-1">{style.description}</p>
                  <p className="text-stone-300">例：{style.example}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-text-dark"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Styles Section */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-stone-500">自定義風格</h4>
            <button 
              onClick={toggleStyleDeleteMode} 
              disabled={customStyles.length === 0 && !isStyleDeleteMode}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                isStyleDeleteMode 
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                  : 'text-stone-400 hover:text-red-400 disabled:opacity-30'
              }`}
              title={isStyleDeleteMode ? "完成" : "刪除"}
            >
              {isStyleDeleteMode ? <>完成 <Check size={12} /></> : <Trash2 size={14} />}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {customStyles.map(style => {
              if (isStyleDeleteMode) {
                return (
                  <button
                    key={style}
                    onClick={() => handleDeleteCustomStyle(style)}
                    className="bg-white text-stone-400 border border-stone-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 px-4 py-2 rounded text-sm transition-all flex items-center gap-1 group shadow-sm"
                  >
                    {style} <X size={14} className="text-stone-300 group-hover:text-red-500"/>
                  </button>
                );
              }

              const isSelected = selectedStyles.has(style);
              return (
                <button
                  key={style}
                  onClick={() => onToggleStyle(style)}
                  className={`
                    px-4 py-2 rounded text-sm transition-all border
                    ${isSelected 
                      ? 'bg-selected text-primary font-bold border-selected shadow-sm' 
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-selected'
                    }
                  `}
                >
                  {style}
                </button>
              );
            })}

            {/* Input */}
            {!isStyleDeleteMode && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                   <Plus size={14} className="text-primary/60" />
                </div>
                <input 
                  type="text" 
                  value={customStyleInput}
                  onChange={(e) => setCustomStyleInput(e.target.value)}
                  onKeyDown={handleKeyPressStyle}
                  placeholder="新增"
                  className="pl-7 pr-2 py-1.5 w-24 focus:w-32 rounded text-sm transition-all border-2 border-dashed border-primary/40 text-text-dark placeholder-primary/50 focus:border-solid focus:border-primary focus:outline-none bg-stone-50 focus:bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Word Limit */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
          <Ruler className="w-5 h-5" />
          字數限制
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {WORD_LIMITS.map(limit => (
            <button
              key={limit}
              onClick={() => onSetWordLimit(limit)}
              className={`
                px-4 py-2 rounded text-sm transition-all border
                ${wordLimit === limit
                   ? 'bg-selected text-primary font-bold border-selected shadow-sm' 
                   : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-selected'
                }
              `}
            >
              {limit}字
            </button>
          ))}
          
          <div className="w-px h-8 bg-stone-200 mx-2"></div>
          
          <div className="flex items-center gap-2">
             <span className="text-sm text-stone-500">自訂:</span>
             <input 
               type="number"
               min="10"
               max="1000"
               value={wordLimit}
               onChange={(e) => onSetWordLimit(parseInt(e.target.value) || 0)}
               className="w-20 px-3 py-2 rounded text-sm border border-stone-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-center bg-stone-50 focus:bg-white transition-all"
             />
             <span className="text-sm text-stone-500">字</span>
          </div>
        </div>
      </div>

      {/* Preview & Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        
        {/* Header: Title & Generate Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary whitespace-nowrap">
            {isShowingPrompt ? <Eye className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {isShowingPrompt ? 'Prompt 預覽' : '評語預覽'}
            {studentName && <span className="text-secondary">({studentName})</span>}
          </h3>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={onShowPrompt}
              disabled={!studentName}
              className={`
                flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg transition-all border text-sm
                ${!studentName 
                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50 hover:text-stone-800'
                }
              `}
            >
              <Eye size={16} />
              生成 Prompt
            </button>

            <button
              onClick={onGenerate}
              disabled={isGenerating || !studentName || !hasValidApiKey}
              title={!hasValidApiKey ? "請先輸入有效的 API Key (以 AIza 開頭)" : ""}
              className={`
                flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg font-bold text-white transition-all shadow-sm text-sm
                ${isGenerating || !studentName || !hasValidApiKey
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover active:scale-[0.98]'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  生成評語
                </>
              )}
            </button>
          </div>
        </div>

        {/* API Key Input Row */}
        <div className="mb-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            isInvalidFormat ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-stone-50'
          }`}>
            <Key className={`w-4 h-4 ${hasValidApiKey ? 'text-primary' : 'text-stone-400'}`} />
            <input 
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="請在此輸入 Gemini API Key 以啟用自動生成 (格式：AIza...)"
              className={`flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-dark placeholder-stone-400 outline-none ${
                isInvalidFormat ? 'text-red-600' : ''
              }`}
            />
            <button 
              onClick={() => setShowKey(!showKey)} 
              className="text-stone-400 hover:text-stone-600"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {hasValidApiKey && (
               <Check size={16} className="text-green-500" />
            )}
            {isInvalidFormat && (
               <div className="flex items-center gap-1 text-red-500 text-xs font-medium whitespace-nowrap">
                 <AlertCircle size={14} />
                 <span>格式錯誤</span>
               </div>
            )}
          </div>
          <div className="mt-1.5 ml-1 text-xs text-stone-500 flex items-start gap-1">
            <span className="text-primary mt-0.5">💡</span>
            <span>
              若無 API Key，可點擊上方 <b>「生成 Prompt」</b>，將提示詞複製到您的AI工具使用。
            </span>
          </div>
        </div>
        
        {/* Text Area */}
        <textarea
          value={previewText}
          onChange={(e) => onTextChange(e.target.value)}
          readOnly={!studentName && !isShowingPrompt}
          className={`w-full h-48 p-4 border rounded-lg text-text-dark mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all
            ${!studentName && !isShowingPrompt ? 'bg-stone-50 cursor-not-allowed' : 'bg-warm-gray focus:bg-white'}
            ${isShowingPrompt ? 'border-stone-300 font-mono text-sm' : 'border-stone-200'}
          `}
          placeholder={isShowingPrompt ? "Prompt 將顯示在這裡..." : "生成的評語將顯示在這裡，您也可以直接在此修改..."}
        />

        {/* Footer: Copy Button (Final Action) */}
        <div className="flex justify-end">
          <button
            onClick={handleCopy}
            disabled={!previewText}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-sm
              ${copySuccess 
                ? 'bg-green-500 text-white border-green-600' 
                : 'bg-secondary text-white hover:bg-secondary-hover disabled:bg-stone-300 disabled:cursor-not-allowed'
              }
            `}
          >
            {copySuccess ? <Check size={18} /> : <Copy size={18} />}
            {copySuccess ? '已複製！' : '複製文字'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;