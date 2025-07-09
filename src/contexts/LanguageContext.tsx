import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ru' | 'he';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    join_server: "Join PicHunter Server",
    login_title: "Login to PicHunter",
    register_description: "Register to access our Minecraft world",
    login_description: "Sign in to your account",
    server_ip: "Server IP:",
    full_name: "Full Name",
    age: "Age",
    class_grade: "Class/Grade (Optional)",
    minecraft_nickname: "Minecraft Nickname",
    email_address: "Email Address",
    password: "Password",
    join_server_btn: "Join Server",
    sign_in_btn: "Sign In",
    creating_account: "Creating Account...",
    signing_in: "Signing In...",
    switch_to_login: "Already have an account? Sign In",
    switch_to_register: "Don't have an account? Register",
    welcome_title: "Welcome to PicHunter Server!",
    welcome_message: "Hey",
    ready_to_build: "Ready to hunt and build together?",
  },
  ru: {
    join_server: "Присоединиться к серверу PicHunter",
    login_title: "Вход в PicHunter",
    register_description: "Зарегистрируйтесь для доступа к нашему миру Minecraft",
    login_description: "Войдите в свой аккаунт",
    server_ip: "IP сервера:",
    full_name: "Полное имя",
    age: "Возраст",
    class_grade: "Класс (Необязательно)",
    minecraft_nickname: "Ник в Minecraft",
    email_address: "Адрес электронной почты",
    password: "Пароль",
    join_server_btn: "Присоединиться к серверу",
    sign_in_btn: "Войти",
    creating_account: "Создание аккаунта...",
    signing_in: "Вход в систему...",
    switch_to_login: "Уже есть аккаунт? Войти",
    switch_to_register: "Нет аккаунта? Зарегистрироваться",
    welcome_title: "Добро пожаловать на сервер PicHunter!",
    welcome_message: "Привет",
    ready_to_build: "Готовы охотиться и строить вместе?",
  },
  he: {
    join_server: "הצטרף לשרת PicHunter",
    login_title: "התחברות ל-PicHunter",
    register_description: "הירשם כדי לקבל גישה לעולם המיינקראפט שלנו",
    login_description: "התחבר לחשבון שלך",
    server_ip: "IP השרת:",
    full_name: "שם מלא",
    age: "גיל",
    class_grade: "כיתה (אופציונלי)",
    minecraft_nickname: "כינוי במיינקראפט",
    email_address: "כתובת אימייל",
    password: "סיסמה",
    join_server_btn: "הצטרף לשרת",
    sign_in_btn: "התחבר",
    creating_account: "יוצר חשבון...",
    signing_in: "מתחבר...",
    switch_to_login: "יש לך כבר חשבון? התחבר",
    switch_to_register: "אין לך חשבון? הירשם",
    welcome_title: "ברוכים הבאים לשרת PicHunter!",
    welcome_message: "היי",
    ready_to_build: "מוכנים לצוד ולבנות יחד?",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
