/**
 * Конфигурация пресетов проектов и шаблонов для NovaCode IDE
 * Содержит стартовые структуры файлов для всех поддерживаемых технологий.
 */

import type { PresetConfig, FileNode, SqlDatabase } from '../types/ide';

// Список пресетов запуска с иконками и описанием
export const PRESETS_LIST: PresetConfig[] = [
  {
    id: 'custom',
    name: 'Пользовательский проект (Любая папка / Файлы)',
    category: 'custom',
    description: 'Произвольный проект без жесткого шаблона. Поддерживает открытие любой папки и любых файлов.',
    defaultEntryPoint: 'index.html',
    iconName: 'Code2',
    runCommandLabel: 'Запустить проект'
  },
  {
    id: 'fullstack',
    name: 'Fullstack (React + Express + PostgreSQL)',
    category: 'fullstack',
    description: 'Полный стек: Клиент React, Сервер Express Node.js и база данных PostgreSQL.',
    defaultEntryPoint: 'server/server.js',
    iconName: 'Layers',
    runCommandLabel: 'Запустить Fullstack Сервер'
  },
  {
    id: 'react',
    name: 'Frontend React (TSX)',
    category: 'frontend',
    description: 'Клиентское приложение на React с поддержкой JSX/TSX компонентов.',
    defaultEntryPoint: 'src/App.tsx',
    iconName: 'Atom',
    runCommandLabel: 'Запустить React Live Server'
  },
  {
    id: 'frontend_vanilla',
    name: 'Frontend Vanilla (HTML / CSS / JS)',
    category: 'frontend',
    description: 'Чистый веб-проект без сторонних библиотек и сборщиков.',
    defaultEntryPoint: 'index.html',
    iconName: 'Code2',
    runCommandLabel: 'Запустить HTML Live Preview'
  },
  {
    id: 'vue',
    name: 'Frontend Vue 3 (SFC)',
    category: 'frontend',
    description: 'Приложение на Vue 3 с однофайловыми компонентами (.vue).',
    defaultEntryPoint: 'src/App.vue',
    iconName: 'Component',
    runCommandLabel: 'Запустить Vue Live Preview'
  },
  {
    id: 'angular',
    name: 'Frontend Angular (TS)',
    category: 'frontend',
    description: 'Модульный проект на Angular с TypeScript компонентами.',
    defaultEntryPoint: 'src/app.component.ts',
    iconName: 'ShieldCode',
    runCommandLabel: 'Запустить Angular Live Server'
  },
  {
    id: 'pwa',
    name: 'PWA Web App',
    category: 'pwa',
    description: 'Progressive Web App с Service Worker и manifest.json.',
    defaultEntryPoint: 'index.html',
    iconName: 'Smartphone',
    runCommandLabel: 'Запустить PWA Sandbox'
  },
  {
    id: 'rust',
    name: 'Native Rust App',
    category: 'native',
    description: 'Высокопроизводительное консольное приложение на языке Rust.',
    defaultEntryPoint: 'src/main.rs',
    iconName: 'Cpu',
    runCommandLabel: 'Скомпилировать и Запустить (cargo run)'
  },
  {
    id: 'cpp',
    name: 'Native C++ App',
    category: 'native',
    description: 'Системный проект на C++ с компиляцией и консольным выводом.',
    defaultEntryPoint: 'src/main.cpp',
    iconName: 'Terminal',
    runCommandLabel: 'Скомпилировать C++ (g++)'
  }
];

// Стартовый набор файлов для каждого шаблона
export const PROJECT_TEMPLATES: Record<string, FileNode[]> = {
  // 1. Fullstack Пресет (React + Node.js + PostgreSQL)
  fullstack: [
    {
      id: 'fs-1',
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      isFolder: false,
      content: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Fullstack App NovaCode</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; max-width: 450px; border: 1px solid #334155; }
    button { background: #6366f1; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    button:hover { background: #4f46e5; }
    input { width: 100%; padding: 10px; margin: 8px 0 16px 0; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: white; box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="root">
    <div class="card">
      <h2>🌐 Fullstack Авторизация</h2>
      <p>Сервер Node.js подключен к PostgreSQL БД.</p>
      <form onsubmit="event.preventDefault(); alert('Пользователь зарегистрирован в БД PostgreSQL!');">
        <label>Имя пользователя:</label>
        <input type="text" placeholder="Введите имя..." required value="Алексей Ивановов">
        <label>Email адрес:</label>
        <input type="email" placeholder="example@mail.ru" required value="alexey@novacode.io">
        <button type="submit">Зарегистрироваться в PostgreSQL</button>
      </form>
    </div>
  </div>
</body>
</html>`
    },
    {
      id: 'fs-2',
      name: 'server',
      path: 'server',
      isFolder: true,
      isOpen: true,
      children: [
        {
          id: 'fs-2-1',
          name: 'server.js',
          path: 'server/server.js',
          language: 'javascript',
          isFolder: false,
          content: `// Серверный код Express Node.js для работы с БД
const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Запрос регистрация пользователя
app.post('/api/users/register', (req, res) => {
  const { username, email } = req.body;
  console.log(\`[POSTGRES] Запись нового пользователя: \${username} (\${email})\`);
  res.json({ success: true, message: 'Пользователь успешно создан в базе данных!' });
});

app.listen(PORT, () => {
  console.log(\`⚡ Fullstack Express Сервер запущен на порту \${PORT}\`);
});`
        },
        {
          id: 'fs-2-2',
          name: 'db.sql',
          path: 'server/db.sql',
          language: 'sql',
          isFolder: false,
          content: `-- Схема таблицы пользователей в PostgreSQL
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Тестовые данные
INSERT INTO users (username, email) VALUES
('alex_dev', 'alex@novacode.ru'),
('elena_designer', 'elena@art.com'),
('dmitry_backend', 'dmitry@node.io');`
        }
      ]
    }
  ],

  // 2. React Пресет
  react: [
    {
      id: 'r-1',
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      isFolder: false,
      content: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>React App - NovaCode</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
    },
    {
      id: 'r-2',
      name: 'src',
      path: 'src',
      isFolder: true,
      isOpen: true,
      children: [
        {
          id: 'r-2-1',
          name: 'App.tsx',
          path: 'src/App.tsx',
          language: 'tsx',
          isFolder: false,
          content: `// Главный компонент React приложения
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState<number>(0);
  const [text, setText] = useState<string>('Привет из React!');

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', background: '#090d16', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#61dafb' }}>⚛️ React TSX Компонент</h1>
      <p>{text}</p>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => setCount(prev => prev + 1)}
          style={{ padding: '10px 20px', background: '#61dafb', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Счетчик: {count}
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{ padding: '10px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}`
        },
        {
          id: 'r-2-2',
          name: 'App.css',
          path: 'src/App.css',
          language: 'css',
          isFolder: false,
          content: `/* Стили для React приложения */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #0d1117;
  color: #c9d1d9;
}`
        }
      ]
    }
  ],

  // 3. Frontend Vanilla Пресет
  frontend_vanilla: [
    {
      id: 'fv-1',
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      isFolder: false,
      content: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>NovaCode - Frontend Vanilla</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="hero">
    <h1>⚡ Чистый Frontend (HTML/CSS/JS)</h1>
    <p>Кастомный интерактивный веб-проект без сторонних библиотек.</p>
    <button id="btnClick">Нажми на меня!</button>
    <div id="output"></div>
  </main>
  <script src="script.js"></script>
</body>
</html>`
    },
    {
      id: 'fv-2',
      name: 'styles.css',
      path: 'styles.css',
      language: 'css',
      isFolder: false,
      content: `/* Заказные стили для чистой веб-страницы */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.hero {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 3rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

button {
  background: #ec4899;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

button:hover {
  background: #db2777;
  transform: scale(1.05);
}`
    },
    {
      id: 'fv-3',
      name: 'script.js',
      path: 'script.js',
      language: 'javascript',
      isFolder: false,
      content: `// JavaScript скрипт страницы
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnClick');
  const output = document.getElementById('output');
  let counter = 0;

  btn.addEventListener('click', () => {
    counter++;
    console.log(\`[LOG] Кнопка нажата \${counter} раз(а)\`);
    output.innerHTML = \`<p style="color: #4ade80; margin-top: 15px;">Успешно! Кликов: <strong>\${counter}</strong></p>\`;
  });
});`
        }
  ],

  // 4. Rust Пресет
  rust: [
    {
      id: 'rs-1',
      name: 'Cargo.toml',
      path: 'Cargo.toml',
      language: 'json',
      isFolder: false,
      content: `[package]
name = "novacode_rust_app"
version = "0.1.0"
edition = "2021"

[dependencies]`
    },
    {
      id: 'rs-2',
      name: 'src',
      path: 'src',
      isFolder: true,
      isOpen: true,
      children: [
        {
          id: 'rs-2-1',
          name: 'main.rs',
          path: 'src/main.rs',
          language: 'rust',
          isFolder: false,
          content: `// Главная точка входа приложения на языке Rust
fn main() {
    println!("🦀 Приветствуем в NovaCode Rust Environment!");
    
    let numbers = vec![10, 20, 30, 40, 50];
    let sum: i32 = numbers.iter().sum();
    
    println!("Вычисление суммы элементов: {:?}", numbers);
    println!("Итоговая сумма: {}", sum);
    
    struct Developer {
        name: String,
        language: String,
    }
    
    let dev = Developer {
        name: String::from("Иван"),
        language: String::from("Rust"),
    };
    
    println!("Разработчик {} пишет на языке {}", dev.name, dev.language);
}`
        }
      ]
    }
  ],

  // 5. C++ Пресет
  cpp: [
    {
      id: 'cpp-1',
      name: 'src',
      path: 'src',
      isFolder: true,
      isOpen: true,
      children: [
        {
          id: 'cpp-2-1',
          name: 'main.cpp',
          path: 'src/main.cpp',
          language: 'cpp',
          isFolder: false,
          content: `// Системная программа на C++
#include <iostream>
#include <vector>
#include <string>

class User {
public:
    std::string name;
    int roleId;

    User(std::string n, int r) : name(n), roleId(r) {}

    void printInfo() {
        std::cout << "Пользователь: " << name << " [ID роли: " << roleId << "]" << std::endl;
    }
};

int main() {
    std::cout << "⚙️ Запуск компилируемой программы C++ в NovaCode IDE" << std::endl;
    
    std::vector<User> team;
    team.push_back(User("Максим", 1));
    team.push_back(User("Ольга", 2));

    for (auto& member : team) {
        member.printInfo();
    }

    return 0;
}`
        }
      ]
    }
  ]
};

// Пример баз данных для Visual SQL DB Viewer
export const DEMO_DATABASE: SqlDatabase = {
  name: 'postgres_main_db',
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'username', type: 'VARCHAR(100)' },
        { name: 'email', type: 'VARCHAR(150)' },
        { name: 'role', type: 'VARCHAR(50)' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ],
      rows: [
        { id: 1, username: 'alex_dev', email: 'alex@novacode.ru', role: 'Администратор', created_at: '2026-07-27 10:15:00' },
        { id: 2, username: 'elena_ui', email: 'elena@art.com', role: 'Дизайнер', created_at: '2026-07-27 10:20:12' },
        { id: 3, username: 'dmitry_node', email: 'dmitry@express.io', role: 'Backend Разработчик', created_at: '2026-07-27 10:45:30' },
        { id: 4, username: 'sergey_rust', email: 'sergey@cargo.org', role: 'Rust Инженер', created_at: '2026-07-27 11:00:00' }
      ]
    },
    {
      name: 'projects',
      columns: [
        { name: 'project_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'title', type: 'VARCHAR(200)' },
        { name: 'tech_stack', type: 'VARCHAR(100)' },
        { name: 'status', type: 'VARCHAR(50)' }
      ],
      rows: [
        { project_id: 101, title: 'NovaCode Custom IDE', tech_stack: 'React + TypeScript + Rust', status: 'Активный' },
        { project_id: 102, title: 'CRM Торговая Панель', tech_stack: 'Fullstack Node + PostgreSQL', status: 'В разработке' },
        { project_id: 103, title: 'Мобильный PWA Клиент', tech_stack: 'PWA Web App', status: 'Завершен' }
      ]
    }
  ]
};
