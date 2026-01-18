import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus, X, Check } from 'lucide-react';
import { TRAIT_DATA } from '../constants';

interface TraitSelectorProps {
  selectedTraits: Set<string>;
  onToggleTrait: (trait: string) => void;
  onClearTraits: () => void;
  onDeleteTrait: (trait: string) => void;
  disabled: boolean;
}

const TraitSelector: React.FC<TraitSelectorProps> = ({ 
  selectedTraits, 
  onToggleTrait,
  onClearTraits,
  onDeleteTrait,
  disabled
}) => {
  const [customTraits, setCustomTraits] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('customTraits');
    if (saved) {
      setCustomTraits(JSON.parse(saved));
    }
  }, []);

  const handleAddCustomTrait = () => {
    const trait = customInput.trim();
    if (trait) {
      if (!customTraits.includes(trait)) {
        const newTraits = [...customTraits];
        if (newTraits.length >= 10) newTraits.shift();
        newTraits.push(trait);
        setCustomTraits(newTraits);
        localStorage.setItem('customTraits', JSON.stringify(newTraits));
        setCustomInput('');
      } else {
        setCustomInput('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent triggering when IME composition is active (e.g. typing Chinese)
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTrait();
    }
  };

  const handleDeleteCustomTrait = (traitToDelete: string) => {
    const newTraits = customTraits.filter(t => t !== traitToDelete);
    setCustomTraits(newTraits);
    localStorage.setItem('customTraits', JSON.stringify(newTraits));
    
    // Call parent to remove from global history and current selection
    onDeleteTrait(traitToDelete);

    if (newTraits.length === 0) {
      setIsDeleteMode(false);
    }
  };

  const toggleDeleteMode = () => {
    if (customTraits.length === 0 && !isDeleteMode) return;
    setIsDeleteMode(!isDeleteMode);
  };

  const renderTraitButton = (trait: string) => {
    const isSelected = selectedTraits.has(trait);
    return (
      <button
        key={trait}
        onClick={() => onToggleTrait(trait)}
        disabled={disabled}
        className={`
          px-3 py-1.5 rounded text-sm transition-all border
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isSelected 
            ? 'bg-selected text-primary font-bold border-selected shadow-sm' 
            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-selected'
          }
        `}
      >
        {trait}
      </button>
    );
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-6 transition-opacity ${disabled ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          特質選擇
        </h3>
        <div className="flex gap-2">
           <button 
            onClick={onClearTraits}
            disabled={disabled}
            className="text-sm px-3 py-1 bg-stone-100 text-stone-500 rounded hover:bg-stone-200 disabled:opacity-50 transition-colors"
          >
            清空選擇
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {TRAIT_DATA.map((category) => (
          <div key={category.name} className="bg-stone-50 p-3 rounded-lg border border-stone-100">
            <h4 className="font-bold text-stone-600 mb-2 border-b border-stone-200 pb-1">
              {category.name}
            </h4>
            <div className="flex flex-wrap gap-1">
              {category.traits.map(renderTraitButton)}
            </div>
          </div>
        ))}
        
        {/* Custom Traits Section - Integrated Input */}
        <div className="bg-stone-50 p-3 rounded-lg border border-selected min-h-[120px]">
          <h4 className="font-bold text-primary mb-2 border-b border-selected pb-1 flex justify-between items-center">
            自定義特質
            <button 
              onClick={toggleDeleteMode} 
              disabled={customTraits.length === 0 && !isDeleteMode}
              className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                isDeleteMode 
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                  : 'text-stone-400 hover:text-red-400 disabled:opacity-30'
              }`} 
              title={isDeleteMode ? "完成編輯" : "刪除特質"}
            >
              {isDeleteMode ? (
                <>完成 <Check size={12} /></>
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {customTraits.map(trait => {
              if (isDeleteMode) {
                return (
                  <button
                    key={trait}
                    onClick={() => handleDeleteCustomTrait(trait)}
                    className="px-3 py-1.5 rounded text-sm transition-all border bg-white text-stone-400 border-stone-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center gap-1 group shadow-sm"
                  >
                    {trait}
                    <X size={14} className="text-stone-300 group-hover:text-red-500" />
                  </button>
                );
              }
              return renderTraitButton(trait);
            })}
            
            {/* Inline Input Field - Hidden in delete mode */}
            {!isDeleteMode && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                   <Plus size={14} className="text-primary/60" />
                </div>
                <input 
                  type="text" 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={disabled}
                  placeholder="新增 (Enter)"
                  className="pl-7 pr-2 py-1.5 w-28 focus:w-36 rounded text-sm transition-all border-2 border-dashed border-primary/40 text-text-dark placeholder-primary/50 focus:border-solid focus:border-primary focus:outline-none bg-white/50 focus:bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Traits Summary */}
      <div className="mt-6 p-4 bg-selected bg-opacity-30 rounded-lg border border-selected min-h-[60px]">
        <h4 className="text-sm font-bold text-primary mb-2">已選擇的特質：</h4>
        <div className="flex flex-wrap gap-2">
          {selectedTraits.size === 0 && <span className="text-stone-400 text-sm italic">請點選上方特質按鈕...</span>}
          {Array.from(selectedTraits).map(trait => (
            <span 
              key={trait} 
              className="px-3 py-1 bg-white text-primary border border-primary rounded-full text-sm font-bold cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-400 transition-colors shadow-sm"
              onClick={() => onToggleTrait(trait)}
              title="點擊移除"
            >
              {trait} ×
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraitSelector;