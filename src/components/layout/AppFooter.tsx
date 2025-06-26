// src/components/layout/AppFooter.tsx

import React from 'react';

/**
 * @component AppFooter
 * @description Компонент подвала приложения, отображающий информацию об авторских правах.
 */
const AppFooter: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} BookSwap. Все права защищены.</p>
                <p>Разработано с ❤️ для обмена книгами.</p>
            </div>
        </footer>
    );
};

export default AppFooter;
