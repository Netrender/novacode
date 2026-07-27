/**
 * Кастомный движок автодополнения (IntelliSense Popup) для NovaCode IDE
 * Подбирает релевантные подсказки и сниппеты кода по языку программирования.
 */

import type { AutocompleteItem, SupportedLanguage } from '../types/ide';

// Подсказки для React / JSX / TSX
const REACT_ITEMS: AutocompleteItem[] = [
  { label: 'useState', insertText: 'const [state, setState] = useState(initialValue);', kind: 'snippet', detail: 'React Hook', documentation: 'Создает состояние компонента.' },
  { label: 'useEffect', insertText: 'useEffect(() => {\n  // Код эффекта\n  return () => {};\n}, []);', kind: 'snippet', detail: 'React Hook', documentation: 'Побочный эффект жизненного цикла.' },
  { label: 'useContext', insertText: 'const value = useContext(MyContext);', kind: 'snippet', detail: 'React Hook', documentation: 'Получение контекста.' },
  { label: 'useRef', insertText: 'const ref = useRef(null);', kind: 'snippet', detail: 'React Hook', documentation: 'Ссылка на DOM-элемент или значение.' },
  { label: '<div className="...">', insertText: '<div className="">\n  \n</div>', kind: 'tag', detail: 'JSX Контейнер', documentation: 'Стандартный JSX div элемент.' },
  { label: '<button onClick={}>', insertText: '<button onClick={() => {}}>\n  Нажать\n</button>', kind: 'tag', detail: 'JSX Кнопка', documentation: 'JSX кнопка с событием клика.' },
  { label: 'console.log', insertText: 'console.log("LOG:", );', kind: 'snippet', detail: 'Console Out', documentation: 'Вывод в консоль IDE.' }
];

// Подсказки для HTML
const HTML_ITEMS: AutocompleteItem[] = [
  { label: '<div>', insertText: '<div>\n  \n</div>', kind: 'tag', detail: 'HTML5 Контейнер' },
  { label: '<button>', insertText: '<button type="button">Кнопка</button>', kind: 'tag', detail: 'HTML5 Кнопка' },
  { label: '<input>', insertText: '<input type="text" placeholder="Введите..." />', kind: 'tag', detail: 'Поле ввода' },
  { label: '<form>', insertText: '<form onsubmit="event.preventDefault();">\n  \n</form>', kind: 'tag', detail: 'Форма' },
  { label: '<h1>', insertText: '<h1>Заголовок</h1>', kind: 'tag', detail: 'Заголовок 1' }
];

// Подсказки для CSS
const CSS_ITEMS: AutocompleteItem[] = [
  { label: 'display: flex;', insertText: 'display: flex;\njustify-content: center;\nalign-items: center;', kind: 'snippet', detail: 'CSS Flexbox Layout' },
  { label: 'display: grid;', insertText: 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\ngap: 16px;', kind: 'snippet', detail: 'CSS Grid Layout' },
  { label: 'background-color', insertText: 'background-color: #6366f1;', kind: 'property', detail: 'Цвет фона' },
  { label: 'border-radius', insertText: 'border-radius: 8px;', kind: 'property', detail: 'Скругление углов' },
  { label: 'backdrop-filter', insertText: 'backdrop-filter: blur(10px);', kind: 'property', detail: 'Эффект размытия стекла' }
];

// Подсказки для Rust
const RUST_ITEMS: AutocompleteItem[] = [
  { label: 'fn main()', insertText: 'fn main() {\n    println!("Hello Rust!");\n}', kind: 'snippet', detail: 'Rust Точка входа', documentation: 'Главная функция программы Rust.' },
  { label: 'println!', insertText: 'println!("Значение: {}", value);', kind: 'snippet', detail: 'Rust Макрос', documentation: 'Печать формата в stdout.' },
  { label: 'struct Name', insertText: 'struct Developer {\n    name: String,\n    age: u32,\n}', kind: 'snippet', detail: 'Rust Структура', documentation: 'Объявление пользовательского типа данных.' },
  { label: 'let mut', insertText: 'let mut count = 0;', kind: 'keyword', detail: 'Изменяемая переменная' }
];

// Подсказки для C++
const CPP_ITEMS: AutocompleteItem[] = [
  { label: 'int main()', insertText: 'int main() {\n    std::cout << "Hello C++!" << std::endl;\n    return 0;\n}', kind: 'snippet', detail: 'C++ Main Function', documentation: 'Главная точка входа программы C++.' },
  { label: 'std::cout', insertText: 'std::cout << "Текст: " << val << std::endl;', kind: 'snippet', detail: 'C++ Output', documentation: 'Вывод строки в стандартный поток.' },
  { label: '#include <iostream>', insertText: '#include <iostream>\n#include <vector>\n#include <string>', kind: 'snippet', detail: 'Заголовочные файлы' },
  { label: 'class Name', insertText: 'class User {\npublic:\n    std::string name;\n    User(std::string n) : name(n) {}\n};', kind: 'snippet', detail: 'C++ Класс' }
];

// Подсказки для SQL
const SQL_ITEMS: AutocompleteItem[] = [
  { label: 'SELECT * FROM', insertText: 'SELECT * FROM users WHERE id = 1;', kind: 'snippet', detail: 'SQL Запрос выборки' },
  { label: 'CREATE TABLE', insertText: 'CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  username VARCHAR(100) NOT NULL,\n  email VARCHAR(150)\n);', kind: 'snippet', detail: 'Создание таблицы SQL' },
  { label: 'INSERT INTO', insertText: 'INSERT INTO users (username, email) VALUES (\'alex\', \'alex@mail.ru\');', kind: 'snippet', detail: 'Вставка записи SQL' }
];

/**
 * Возвращает отфильтрованный список автоподсказок по текущему языку и слову
 */
export function getCompletionsForLanguage(language: SupportedLanguage, currentWord: string): AutocompleteItem[] {
  let list: AutocompleteItem[] = [];

  switch (language) {
    case 'jsx':
    case 'tsx':
      list = [...REACT_ITEMS, ...HTML_ITEMS, ...CSS_ITEMS];
      break;
    case 'html':
      list = [...HTML_ITEMS, ...CSS_ITEMS];
      break;
    case 'css':
      list = CSS_ITEMS;
      break;
    case 'rust':
      list = RUST_ITEMS;
      break;
    case 'cpp':
      list = CPP_ITEMS;
      break;
    case 'sql':
      list = SQL_ITEMS;
      break;
    default:
      list = [...REACT_ITEMS, ...HTML_ITEMS];
  }

  if (!currentWord) return list;

  const query = currentWord.toLowerCase();
  return list.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.insertText.toLowerCase().includes(query)
  );
}
