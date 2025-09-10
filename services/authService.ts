import type { Student, FacultyMember, UserRole, Admin } from '../types';
import { ADMIN_USER } from '../constants';

export const getLoggedInUser = (): { user: Student | FacultyMember | Admin | null, role: UserRole | null } => {
    try {
        const userStr = sessionStorage.getItem('loggedInUser');
        const role = sessionStorage.getItem('userRole') as UserRole | null;
        if (userStr && role) {
            return { user: JSON.parse(userStr), role };
        }
    } catch (error) {
        console.error("Failed to get logged in user from sessionStorage", error);
    }
    return { user: null, role: null };
};

export const logout = () => {
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('userRole');
};
