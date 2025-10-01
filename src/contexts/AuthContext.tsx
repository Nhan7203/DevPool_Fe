import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Role =
  | 'Staff HR'
  | 'Staff Accountant'
  | 'Staff Sales'
  | 'Developer'
  | 'Manager'
  | 'Admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'devpool_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function roleDisplayName(role: Role, email: string) {
  switch (role) {
    case 'Staff HR':
      return 'Nhân viên Nhân sự';
    case 'Staff Accountant':
      return 'Nhân viên Kế toán';
    case 'Staff Sales':
      return 'Nhân viên Kinh doanh';
    case 'Developer':
      return 'Lập trình viên';
    case 'Manager':
      return 'Quản lý';
    case 'Admin':
      return 'Admin';
    default:
      return email;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, []);

  const login: AuthContextType['login'] = async (email, _password, role) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const mockUser: User = {
      id: '1',
      email,
      name: roleDisplayName(role, email),
      role,
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    };

    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register: AuthContextType['register'] = async (email, _password, role) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const mockUser: User = {
      id: '1',
      email,
      name: roleDisplayName(role, email),
      role,
    };

    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
