/**
 * Упрощённый чат (AiAssistant.tsx)
 * Использует формат Anthropic API для отправки запросов.
 */

import React, { useState } from 'react';
import { Bot, Send, RefreshCw, X, Sparkles } from 'lucide-react';
import type { AiMessage, FileNode } from '../../types/ide';
import { loadSavedSettings, saveSettings } from '../../utils/storage';

interface AiAssistantProps {
  files: FileNode[];
  activeFileContent?: string;
  activeFileName?: string;
  onClose: () => void;
  width?: number;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  files,
  activeFileContent,
  activeFileName,
  onClose,
  width
}) => {
  const [settings, setSettings] = useState(loadSavedSettings);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я ассистент NovaCode IDE. Задавайте любые вопросы по вашему проекту или коду, а я помогу написать, исправить или улучшить его!',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleModelChange = (model: string) => {
    let provider = settings.aiProvider;
    if (model.includes('gemini')) provider = 'gemini' as any;
    else if (model.includes('claude')) provider = 'anthropic' as any;
    else if (model.includes('gpt')) provider = 'openai' as any;

    const newSet = { ...settings, aiModel: model, aiProvider: provider };
    setSettings(newSet);
    saveSettings(newSet);
  };

  // Отправка запроса в API
  const handleSendMessage = async () => {
    if (!promptInput.trim()) return;

    const userMsg: AiMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setPromptInput('');
    setIsLoading(true);


    try {
      const baseUrl = settings.aiBaseUrl || 'https://bridge.gptclaudegemini.xyz';
      const apiKey = settings.aiApiKey || '';
      const model = settings.aiModel || 'gemini-2.5-pro';
      const maxTokens = 2048;

      if (!apiKey.trim()) {
        const errorMsg: AiMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⚠️ API ключ не указан.\nПожалуйста, откройте **Настройки IDE** (⚙️ в меню или сочетание клавиш `Ctrl+,`) и укажите ваш собственный API ключ для выбранной нейросети.',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }

      const fileContext = activeFileName
        ? `Активный файл (${activeFileName}):\n${activeFileContent}`
        : `Всего файлов: ${files.length}`;

      const systemPrompt = `Вы — помощник программиста. Контекст:\n${fileContext}`;

      const isOpenAI = settings.aiProvider !== 'anthropic';
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      
      let endpoint = '';
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let bodyData: any = {};

      if (isOpenAI) {
        endpoint = cleanBaseUrl.endsWith('/chat/completions') 
          ? cleanBaseUrl 
          : (cleanBaseUrl.endsWith('/v1') ? `${cleanBaseUrl}/chat/completions` : `${cleanBaseUrl}/v1/chat/completions`);
        headers['Authorization'] = `Bearer ${apiKey}`;
        bodyData = {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.id !== '1').map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
            { role: 'user', content: userMsg.content }
          ],
          stream: true
        };
      } else {
        endpoint = cleanBaseUrl.endsWith('/messages') 
          ? cleanBaseUrl 
          : (cleanBaseUrl.endsWith('/v1') ? `${cleanBaseUrl}/messages` : `${cleanBaseUrl}/v1/messages`);
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        bodyData = {
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: messages
            .filter(m => m.id !== '1')
            .concat(userMsg)
            .map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
          stream: true
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error (${response.status}): ${response.statusText} - ${errText}`);
      }
      
      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      const assistantMsgId = Date.now().toString();
      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          thinking: '',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      let fullContent = '';
      let fullThinking = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (isOpenAI) {
                const delta = data.choices?.[0]?.delta;
                if (delta) {
                  if (delta.content) fullContent += delta.content;
                  if (delta.reasoning_content || delta.reasoning) fullThinking += (delta.reasoning_content || delta.reasoning);
                }
              } else {
                if (data.type === 'content_block_delta' || data.type === 'content_block_start') {
                  const delta = data.delta || data.content_block;
                  if (delta?.type === 'text_delta' || delta?.type === 'text') {
                    fullContent += (delta.text || '');
                  } else if (delta?.type === 'thinking_delta' || delta?.type === 'thinking') {
                    fullThinking += (delta.thinking || '');
                  }
                }
              }

              let displayContent = fullContent;
              let displayThinking = fullThinking;

              // Извлекаем <thinking> если прокси отдаёт его текстом
              const thinkingMatch = fullContent.match(/<thinking>([\s\S]*?)(?:<\/thinking>|$)/);
              if (thinkingMatch) {
                displayThinking = (displayThinking + '\n' + thinkingMatch[1]).trim();
                displayContent = fullContent.replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/, '').trim();
              }

              setMessages(prev => prev.map(m => 
                m.id === assistantMsgId 
                  ? { ...m, content: displayContent, thinking: displayThinking }
                  : m
              ));
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Ошибка вызова API: ${err.message || 'Сбой соединения.'}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-pane" style={{ width: width ? `${width}px` : '340px', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Шапка ИИ Панели */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem' }}>
          <Bot size={16} />
          <Sparkles size={14} color="#a855f7" />
          <span>Nova AI:</span>
        </div>
        <input 
          type="text"
          value={settings.aiModel || 'gpt-4o'}
          onChange={(e) => handleModelChange(e.target.value)}
          placeholder="Модель: gpt-4o, claude-3-5-sonnet..."
          style={{ background: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 6px', fontSize: '0.75rem', flex: 1, minWidth: '130px' }}
        />
        <button className="icon-btn" onClick={onClose} title="Закрыть панель">
          <X size={14} />
        </button>
      </div>

      {/* Сообщения */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '94%',
              background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '4px' }}>
              {msg.role === 'user' ? 'Вы' : `Помощник`} • {msg.timestamp}
            </div>
            {msg.thinking && (
              <details style={{ marginBottom: '8px', opacity: 0.8 }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Мысли (Thinking)</summary>
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.8rem', marginTop: '4px', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                  {msg.thinking}
                </div>
              </details>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className="spin-icon" /> Загрузка ответа...
          </div>
        )}
      </div>

      {/* Поле ввода */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Напишите сообщение..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
        />
        <button
          className="btn-primary"
          style={{ padding: '0 12px' }}
          onClick={() => handleSendMessage()}
          disabled={isLoading}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
