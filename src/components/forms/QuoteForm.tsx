// src/components/forms/QuoteForm.tsx

import React, { useState } from 'react';

/**
 * @interface QuoteFormProps
 * @description Свойства для компонента QuoteForm.
 * @property {(text: string) => void} onSubmit - Функция, вызываемая при отправке формы с текстом цитаты.
 * @property {() => void} onCancel - Функция, вызываемая при отмене ввода.
 */
interface QuoteFormProps {
    onSubmit: (text: string) => void;
    onCancel: () => void;
}

/**
 * @component QuoteForm
 * @description Форма для добавления новой цитаты к книге.
 */
const QuoteForm: React.FC<QuoteFormProps> = ({ onSubmit, onCancel }) => {
    const [quoteText, setQuoteText] = useState(''); // Состояние для текста цитаты

    /**
     * @function handleSubmit
     * @description Обработчик отправки формы.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quoteText.trim()) { // Проверяем, что текст не пустой
            onSubmit(quoteText.trim()); // Вызываем onSubmit с очищенным текстом
            setQuoteText(''); // Очищаем поле ввода
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-content-form">
            <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Введите цитату..."
                required
                rows={4} // Увеличиваем высоту текстового поля
                aria-label="Текст цитаты"
            />
            <div className="form-actions">
                <button type="submit" className="submit-button">Отправить</button>
                <button type="button" onClick={onCancel} className="cancel-button">Отмена</button>
            </div>
        </form>
    );
};

export default QuoteForm;
