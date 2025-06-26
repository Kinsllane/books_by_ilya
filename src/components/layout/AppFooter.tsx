import React from 'react';
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
