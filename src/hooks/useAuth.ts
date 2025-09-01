'use client'
import { useState } from 'react'
import { api } from '@/lib/api'


export function useAuth() {
const [token, setToken] = useState<string>(() => localStorage.getItem('nf_token') || '')
const [user, setUser] = useState<{ username: string } | null>(() => {
try { return JSON.parse(localStorage.getItem('nf_user')||'null') } catch { return null }
})


const login = async (username: string, password: string) => {
const data = await api<{ token: string }>(`/auth/login`, { method: 'POST', body: { username, password } })
if (typeof data === 'string') throw new Error(data)
setToken(data.token)
setUser({ username })
localStorage.setItem('nf_token', data.token)
localStorage.setItem('nf_user', JSON.stringify({ username }))
}
const logout = () => {
setToken(''); setUser(null)
localStorage.removeItem('nf_token')
localStorage.removeItem('nf_user')
}
return { token, user, login, logout }
}