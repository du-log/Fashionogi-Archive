import { createContext } from "react"

export type User = {
    id: number,
    username: string,
    is_admin: boolean
}

type AuthContextType = {
    isAuth: boolean,
    user: User | null,
    login: (email: string, password: string) => Promise<boolean | undefined>,
    logout: () => Promise<void>,
    register: (username: string, email: string, password: string) => Promise<boolean | { success: boolean, message: string, type: string }>,
    isLoading: boolean,
}

export const AuthContext = createContext<AuthContextType | null>(null);