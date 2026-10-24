import React, { useState } from 'react';
import { playHapticSound, triggerLuxuryCelebration } from '../utils/effects';
import { X, Check, Plus, Type } from 'lucide-react';

export interface PickerOption {
  id: string;
  title: string;
  subtitle?: string;
  previewFontFamily?: string;
  previewText?: string;
  icon?: React.ReactNode;
}

interface CustomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  options: PickerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CustomPickerModal: React.FC<CustomPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  options,
  selectedId,
  onSelect
}) => {
  const [customFontInput, setCustomFontInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleApplyCustomFont = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFontInput.trim()) return;

    const formatted = customFontInput.trim().includes('sans-serif')
      ? customFontInput.trim()
      : `'${customFontInput.trim()}', sans-serif`;

    playHapticSound('success');
    triggerLuxuryCelebration();
    onSelect(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Blurred Backdrop */}
      <div
        onClick={() => {
          playHapticSound('tap');
          onClose();
        }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal / Sheet Container */}
      <div className="relative w-full max-w-md bg-slate-950/95 border-t sm:border border-white/15 rounded-t-[36px] sm:rounded-3xl p-5 shadow-2xl z-10 backdrop-blur-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        {/* Top Grab Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-titles leading-tight">{title}</h3>
              {description && (
                <p className="text-[11px] text-slate-400 mt-0.5 font-hints">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playHapticSound('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors tap-interactive cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 py-1">
          {options.map((opt) => {
            const isSelected = opt.id === selectedId;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playHapticSound('switch');
                  onSelect(opt.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-right flex items-center justify-between transition-all tap-interactive cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600/25 border-purple-400 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/40'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {opt.icon && (
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      {opt.icon}
                    </div>
                  )}
                  <div>
                    <span
                      className={`text-sm font-bold block ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                      style={opt.previewFontFamily ? { fontFamily: opt.previewFontFamily } : undefined}
                    >
                      {opt.title}
                    </span>
                    {opt.subtitle && (
                      <span className="text-[11px] text-slate-400 block mt-0.5 font-hints">
                        {opt.subtitle}
                      </span>
                    )}
                    {opt.previewText && (
                      <div
                        className="text-xs text-purple-300 mt-1 px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10 inline-block font-mono"
                        style={opt.previewFontFamily ? { fontFamily: opt.previewFontFamily } : undefined}
                      >
                        {opt.previewText}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                      : 'border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Font Input from GitHub repo / Custom CSS */}
        <div className="pt-3 border-t border-white/10 mt-2">
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                setShowCustomInput(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer tap-interactive font-titles"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إدخال اسم خط مخصص (من مستودعك في GitHub أو CSS)</span>
            </button>
          ) : (
            <form onSubmit={handleApplyCustomFont} className="space-y-2">
              <span className="text-[11px] text-slate-400 block font-hints">
                اكتب اسم عائلة الخط (Font Family) كما تم تعريفه في مشروعك:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFontInput}
                  onChange={(e) => setCustomFontInput(e.target.value)}
                  placeholder="مثال: Dubiel, Orbitron, VIPFont..."
                  className="flex-1 h-11 rounded-xl bg-black/50 border border-white/20 px-3 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tap-interactive cursor-pointer shrink-0 font-titles"
                >
                  تطبيق
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
