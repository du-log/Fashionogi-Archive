/* Authentication Context file, all endpoint connections utilized for user auth are in AuthProvider */

import { createContext } from "react"

export type User = {
    id: number,
    username: string,
    is_admin: boolean,
    avatar_id: string,
    title_name: string,
    title_type: string
}

type AuthContextType = {
    isAuth: boolean,
    user: User | null,
    login: (email: string, password: string) => Promise<boolean | undefined>,
    logout: () => Promise<void>,
    register: (username: string, email: string, password: string) => Promise<boolean | { success: boolean, message: string, type: string }>,
    isLoading: boolean,
    checkSession: () => Promise<void>,
}

export const AuthContext = createContext<AuthContextType | null>(null);