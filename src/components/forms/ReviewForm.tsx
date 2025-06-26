// src/components/forms/ReviewForm.tsx

import React, { useState } from 'react';

/**
 * @interface ReviewFormProps
 * @description Свойства для компонента ReviewForm.
 * @property {(text: string) => void} onSubmit - Функция, вызываемая при отправке формы с текстом рецензии.
 * @property {() => void} onCancel - Функция, вызываемая при отмене ввода.
 */
interface ReviewFormProps {
    onSubmit: (text: string) => void;
    onCancel: () => void;
}

/**
 * @component ReviewForm
 * @description Форма для добавления новой рецензии к книге.
 */
const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
    const [reviewText, setReviewText] = useState(''); // Состояние для текста рецензии

    /**
     * @function handleSubmit
     * @description Обработчик отправки формы.
     * @param {React.FormEvent} e - Событие формы.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reviewText.trim()) { // Проверяем, что текст не пустой
            onSubmit(reviewText.trim()); // Вызываем onSubmit с очищенным текстом
            setReviewText(''); // Очищаем поле ввода
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-content-form">
            <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Напишите вашу рецензию..."
                required
                rows={4} // Увеличиваем высоту текстового поля
                aria-label="Текст рецензии"
            />
            <div className="form-actions">
                <button type="submit" className="submit-button">Отправить</button>
                <button type="button" onClick={onCancel} className="cancel-button">Отмена</button>
            </div>
        </form>
    );
};

export default ReviewForm;
