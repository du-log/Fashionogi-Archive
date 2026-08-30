import { createContext } from "react"

export type User = {
    id: number,
    username: string
}

type AuthContextType = {
    isAuth: boolean,
    user: User | null,
    login: (email: string, password: string) => Promise<boolean>,
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null);