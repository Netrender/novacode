import React from 'react';
import { Sparkles, Sun, Moon, Globe, Check, ArrowRight, Type, Bot } from 'lucide-react';
import type { IDESettings, AiProvider } from '../../types/ide';

interface OnboardingModalProps {
  settings: IDESettings;
  onUpdateSettings: (newSettings: IDESettings) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const isRu = settings.uiLanguage !== 'en';

  const themes = [
    { id: 'nova-dark', label: isRu ? '🌌 Nova Dark (Космос)' : '🌌 Nova Dark (Cosmic)', desc: isRu ? 'Глубокая тёмно-синяя неоновая тема' : 'Deep dark-blue neon theme' },
    { id: 'vs-dark', label: isRu ? '🌙 VS Code Dark' : '🌙 VS Code Dark', desc: isRu ? 'Классическая тёмная тема разработчика' : 'Classic dark developer theme' },
    { id: 'light', label: isRu ? '☀️ Nova Light (Белая)' : '☀️ Nova Light (White)', desc: isRu ? 'Чистая светлая тема для работы днём' : 'Clean white light theme for daytime' },
    { id: 'light-blue', label: isRu ? '🌊 Light Blue' : '🌊 Light Blue', desc: isRu ? 'Светло-голубая контрастная тема' : 'Soft light-blue contrast theme' },
  ];

  const handleFinish = () => {
    onUpdateSettings({
      ...settings,
      hasSeenOnboarding: true
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-glow)',
        borderRadius: '16px',
        width: '640px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
        padding: '32px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)'
      }}>
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            marginBottom: '16px',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)'
          }}>
            <Sparkles size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(to right, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isRu ? 'Добро пожаловать в NovaCode IDE!' : 'Welcome to NovaCode IDE!'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {isRu ? 'Настройте интерфейс и ИИ-Ассистента для старта работы' : 'Customize your interface and AI assistant to get started'}
          </p>
        </div>

        {/* 1. Язык интерфейса */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
            <Globe size={18} color="var(--accent-cyan)" />
            <span>{isRu ? '1. Выберите язык интерфейса / Language' : '1. Choose Interface Language'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => onUpdateSettings({ ...settings, uiLanguage: 'ru' })}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${settings.uiLanguage === 'ru' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: settings.uiLanguage === 'ru' ? 'var(--bg-active)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: settings.uiLanguage === 'ru' ? 600 : 400
              }}
            >
              <span>🇷🇺 Русский</span>
              {settings.uiLanguage === 'ru' && <Check size={16} color="var(--accent-primary)" />}
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, uiLanguage: 'en' })}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${settings.uiLanguage === 'en' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: settings.uiLanguage === 'en' ? 'var(--bg-active)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: settings.uiLanguage === 'en' ? 600 : 400
              }}
            >
              <span>🇺🇸 English</span>
              {settings.uiLanguage === 'en' && <Check size={16} color="var(--accent-primary)" />}
            </button>
          </div>
        </div>

        {/* 2. Выбор темы оформления */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
            {settings.theme === 'light' || settings.theme === 'light-blue' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#c084fc" />}
            <span>{isRu ? '2. Выберите тему оформления (включая Белую тему)' : '2. Choose Color Theme (including White Theme)'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {themes.map(t => {
              const isSelected = settings.theme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: t.id as any })}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: isSelected ? 'var(--bg-active)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>
                    <span>{t.label}</span>
                    {isSelected && <Check size={16} color="var(--accent-primary)" />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Выбор формата API */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
            <Bot size={18} color="#10b981" />
            <span>{isRu ? '3. Формат ИИ запросов (протокол API)' : '3. AI Request Format (API Protocol)'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { id: 'openai', label: 'Формат OpenAI', desc: isRu ? 'OpenAI, OpenRouter, DeepSeek, Ollama, LM Studio' : 'OpenAI, OpenRouter, DeepSeek, Ollama' },
              { id: 'anthropic', label: 'Формат Anthropic', desc: isRu ? 'Claude 3.5 Sonnet, Haiku, Opus' : 'Claude 3.5 Sonnet, Haiku, Opus' }
            ].map(m => {
              const isSelected = (settings.aiProvider === 'anthropic' ? 'anthropic' : 'openai') === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    const prov: AiProvider = m.id as AiProvider;
                    const url = prov === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.openai.com/v1';
                    const mod = prov === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o';
                    onUpdateSettings({ ...settings, aiProvider: prov, aiBaseUrl: url, aiModel: mod });
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? '#10b981' : 'var(--border-color)'}`,
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>
                    <span>{m.label}</span>
                    {isSelected && <Check size={16} color="#10b981" />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Настройка размера шрифта */}
        <div style={{ marginBottom: '28px', background: 'var(--bg-sidebar)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={18} color="#ec4899" />
              <span>{isRu ? '4. Размер шрифта интерфейса / Font Size' : '4. Interface Font Size'}</span>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>{settings.fontSize || 13}px</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[12, 13, 14, 15, 16].map(size => (
              <button
                key={size}
                onClick={() => onUpdateSettings({ ...settings, fontSize: size })}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${settings.fontSize === size ? 'var(--accent-pink)' : 'var(--border-color)'}`,
                  background: settings.fontSize === size ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: settings.fontSize === size ? 600 : 400
                }}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка запуска */}
        <button
          onClick={handleFinish}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            border: 'none',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <span>{isRu ? '🚀 Начать работу в NovaCode IDE' : '🚀 Launch NovaCode IDE'}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
