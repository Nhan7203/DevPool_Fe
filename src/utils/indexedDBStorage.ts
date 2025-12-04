/**
 * Utility functions để lưu và khôi phục File objects từ IndexedDB
 * File objects không thể serialize vào localStorage, nên sử dụng IndexedDB
 */

const DB_NAME = 'DevPoolFileStorage';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * Mở IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

/**
 * Lưu File object vào IndexedDB
 * @param key - Key để lưu file
 * @param file - File object cần lưu
 */
export const saveFileToIndexedDB = async (key: string, file: File): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Lưu file object (IndexedDB hỗ trợ lưu Blob/File)
    await new Promise<void>((resolve, reject) => {
      const request = store.put(file, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Lưu metadata vào localStorage để dễ kiểm tra
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(`${key}_metadata`, JSON.stringify({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));
  } catch (error) {
    console.error('❌ Lỗi khi lưu file vào IndexedDB:', error);
    throw error;
  }
};

/**
 * Lấy File object từ IndexedDB
 * @param key - Key của file cần lấy
 * @returns File object hoặc null nếu không tìm thấy
 */
export const getFileFromIndexedDB = async (key: string): Promise<File | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const file = await new Promise<File | null>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result || null);
      };
      request.onerror = () => reject(request.error);
    });
    
    return file;
  } catch (error) {
    console.error('❌ Lỗi khi lấy file từ IndexedDB:', error);
    return null;
  }
};

/**
 * Xóa File object khỏi IndexedDB
 * @param key - Key của file cần xóa
 */
export const deleteFileFromIndexedDB = async (key: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Xóa metadata từ localStorage
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.removeItem(`${key}_metadata`);
  } catch (error) {
    console.error('❌ Lỗi khi xóa file từ IndexedDB:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem file có tồn tại trong IndexedDB không
 * @param key - Key của file cần kiểm tra
 * @returns true nếu file tồn tại
 */
export const hasFileInIndexedDB = async (key: string): Promise<boolean> => {
  try {
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const metadata = storage.getItem(`${key}_metadata`);
    
    if (!metadata) return false;
    
    // Kiểm tra xem file có thực sự tồn tại trong IndexedDB không
    const file = await getFileFromIndexedDB(key);
    return file !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Lấy metadata của file từ localStorage
 * @param key - Key của file
 * @returns Metadata hoặc null
 */
export const getFileMetadata = (key: string): { name: string; size: number; type: string; lastModified: number } | null => {
  try {
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const metadata = storage.getItem(`${key}_metadata`);
    
    if (!metadata) return null;
    
    return JSON.parse(metadata);
  } catch (error) {
    return null;
  }
};

