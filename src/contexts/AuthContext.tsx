import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/Auth';
import { auth, onAuthStateChanged } from '../configs/firebase';
import { getUser, getAccessToken, clearAuthData } from '../utils/storage';

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
    // Restore user từ storage (kiểm tra cả localStorage và sessionStorage)
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // Kiểm tra Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase auth state restored:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email
        });
      } else {
        console.warn('Firebase auth state: No user authenticated');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login: AuthContextType['login'] = async (email, _password, role) => {
    setIsLoading(true);
    
    // Lấy thông tin user từ storage (đã được lưu trong LoginForm)
    const storedUser = getUser();
    
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
      return;
    }

    // Nếu không có stored user, tạo user từ thông tin login
    const accessToken = getAccessToken();
    const user: User = {
      id: accessToken || '1', // Có thể lấy từ token hoặc API
      email,
      name: roleDisplayName(role, email),
      role,
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    };

    setUser(user);
    // User đã được lưu trong LoginForm, không cần lưu lại ở đây
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

  const logout = async () => {
    // Logout Firebase
    await authService.logoutFirebase();
    
    // Clear user state và storage (cả localStorage và sessionStorage)
    setUser(null);
    clearAuthData();
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
