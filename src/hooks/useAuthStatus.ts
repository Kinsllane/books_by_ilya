// src/hooks/useAuthStatus.ts

import { useContext } from 'react';
import { UserAuthContext } from '../context/UserAuthContext'; // Импортируем наш контекст

/**
 * @function useAuthStatus
 * @description Кастомный хук для удобного доступа к состоянию аутентификации и функциям из UserAuthContext.
 * @returns {UserAuthContextType} Объект, содержащий activeUser, signIn, signOut, setActiveUser.
 * @throws {Error} Если хук используется вне UserAuthProvider.
 */
export const useAuthStatus = () => {
    const context = useContext(UserAuthContext);
    // Проверяем, что хук используется внутри провайдера
    if (context === undefined) {
        throw new Error('useAuthStatus must be used within a UserAuthProvider');
    }
    return context;
};
