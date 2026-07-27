/**
 * Кастомный токенизатор синтаксиса для NovaCode IDE
 * Подсвечивает HTML, CSS, JavaScript, TypeScript, JSX/TSX, C++, Rust, SQL и JSON.
 * Поддерживает выделение цветовых квадратиков (Color Swatches) для CSS HEX/RGB.
 */

import type { SupportedLanguage } from '../types/ide';

// Вспомогательная функция для безопасного экранирования HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Токенизирует одну строку кода и возвращает HTML-строку с нужными подсветками спанов.
 */
export function tokenizeLine(line: string, language: SupportedLanguage): string {
  if (!line) return '&nbsp;';

  let escaped = escapeHtml(line);

  // 1. Подсветка комментариев
  if (escaped.trim().startsWith('//') || escaped.trim().startsWith('#')) {
    return `<span class="token-comment">${escaped}</span>`;
  }
  if (escaped.trim().startsWith('/*') || escaped.trim().startsWith('--')) {
    return `<span class="token-comment">${escaped}</span>`;
  }

  // 2. CSS подсветка и визуальные плашки для цветов (Color Swatches)
  if (language === 'css') {
    // Подсветка HEX цветов (#ffffff, #6366f1)
    escaped = escaped.replace(/(#[0-9a-fA-F]{3,8})/g, (match) => {
      return `<span class="color-swatch-badge" style="background-color:${match}"></span><span class="token-color">${match}</span>`;
    });
    // Подсветка RGB/HSL
    escaped = escaped.replace(/(rgb\([^)]+\)|rgba\([^)]+\))/g, (match) => {
      return `<span class="color-swatch-badge" style="background-color:${match}"></span><span class="token-color">${match}</span>`;
    });
    // CSS Свойства
    escaped = escaped.replace(/([a-zA-Z0-9-]+)\s*:/g, '<span class="token-property">$1</span>:');
    return escaped;
  }

  // 3. HTML / JSX Теги
  if (language === 'html' || language === 'jsx' || language === 'tsx' || language === 'vue') {
    // Теги &lt;tagname&gt;
    escaped = escaped.replace(/&lt;(\/?[a-zA-Z0-9-]+)/g, '&lt;<span class="token-tag">$1</span>');
    // React хуки
    escaped = escaped.replace(/\b(useState|useEffect|useContext|useRef|useMemo|useCallback)\b/g, '<span class="token-hook">$1</span>');
  }

  // 4. Ключевые слова JavaScript / TypeScript / JSX
  if (['javascript', 'typescript', 'jsx', 'tsx', 'vue'].includes(language)) {
    const jsKeywords = /\b(const|let|var|function|return|import|export|from|default|if|else|for|while|async|await|try|catch|new|class|extends|interface|type)\b/g;
    escaped = escaped.replace(jsKeywords, '<span class="token-keyword">$1</span>');

    // Ключевое слово `this`, `true`, `false`, `null`, `undefined`
    escaped = escaped.replace(/\b(true|false|null|undefined|this)\b/g, '<span class="token-boolean">$1</span>');
  }

  // 5. Rust Ключевые слова
  if (language === 'rust') {
    const rustKeywords = /\b(fn|let|mut|struct|enum|impl|trait|use|mod|pub|return|match|if|else|for|in|while|loop|where|move|type)\b/g;
    escaped = escaped.replace(rustKeywords, '<span class="token-keyword">$1</span>');
    // Макросы println!, vec!
    escaped = escaped.replace(/\b([a-zA-Z0-9_]+!)/g, '<span class="token-macro">$1</span>');
  }

  // 6. C++ Ключевые слова
  if (language === 'cpp') {
    const cppKeywords = /\b(int|char|float|double|void|class|public|private|protected|struct|namespace|using|return|if|else|for|while|const|auto|new|delete)\b/g;
    escaped = escaped.replace(cppKeywords, '<span class="token-keyword">$1</span>');
    // `#include`, `#define`
    escaped = escaped.replace(/(#include|#define|#ifndef|#endif)/g, '<span class="token-macro">$1</span>');
    escaped = escaped.replace(/\b(std::cout|std::cin|std::endl|std::vector|std::string)\b/g, '<span class="token-builtin">$1</span>');
  }

  // 7. SQL Ключевые слова
  if (language === 'sql') {
    const sqlKeywords = /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|CREATE|TABLE|DROP|ALTER|PRIMARY|KEY|VARCHAR|INTEGER|TIMESTAMP|NOT|NULL|UNIQUE|DEFAULT|JOIN|ON|GROUP|BY|ORDER|LIMIT)\b/gi;
    escaped = escaped.replace(sqlKeywords, '<span class="token-keyword">$1</span>');
  }

  // 8. Подсветка строк в кавычках (Строковые литералы)
  escaped = escaped.replace(/(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`)/g, '<span class="token-string">$1</span>');

  // 9. Числа
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');

  return escaped;
}
