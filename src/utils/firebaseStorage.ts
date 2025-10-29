import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../configs/firebase';

/**
 * Upload CV file to Firebase Storage
 * @param file - File to upload
 * @param talentId - ID of the talent
 * @param versionName - Version name of the CV
 * @param onProgress - Callback for upload progress (0-100)
 * @returns Promise with download URL
 */
export const uploadTalentCV = async (
  file: File,
  talentId: number,
  versionName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận file PDF, DOC hoặc DOCX');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File không được vượt quá 10MB');
  }

  // Create file path with clear structure: talent-cvs/{talentId}/{versionName}_{timestamp}_{filename}
  const timestamp = Date.now();
  const sanitizedVersionName = versionName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileExtension = file.name.split('.').pop();
  const fileName = `${sanitizedVersionName}_${timestamp}.${fileExtension}`;
  const filePath = `talent-cvs/${talentId}/${fileName}`;

  // Create storage reference
  const storageRef = ref(storage, filePath);

  // Upload file with progress tracking
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        // Handle upload errors
        console.error('Upload error:', error);
        reject(new Error('Lỗi khi upload file: ' + error.message));
      },
      async () => {
        // Upload completed successfully, get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(new Error('Không thể lấy URL của file'));
        }
      }
    );
  });
};

/**
 * Delete CV file from Firebase Storage
 * @param fileUrl - Download URL of the file to delete
 */
export const deleteTalentCV = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Không thể xóa file');
  }
};

/**
 * Upload file to Firebase Storage (generic function)
 * @param file - File to upload
 * @param path - Storage path (e.g., 'contracts/filename')
 * @param onProgress - Callback for upload progress (0-100)
 * @returns Promise with download URL
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File không được vượt quá 10MB');
  }

  // Create storage reference
  const storageRef = ref(storage, path);

  // Upload file with progress tracking
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        // Handle upload errors
        console.error('Upload error:', error);
        reject(new Error('Lỗi khi upload file: ' + error.message));
      },
      async () => {
        // Upload completed successfully, get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(new Error('Không thể lấy URL của file'));
        }
      }
    );
  });
};

/**
 * Get file info from URL
 */
export const getFileInfo = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathname = decodeURIComponent(urlObj.pathname);
    const fileName = pathname.split('/').pop() || '';
    return { fileName };
  } catch {
    return { fileName: 'unknown' };
  }
};

