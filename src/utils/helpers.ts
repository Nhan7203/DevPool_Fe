// Helper function để format số tiền theo VND (1.000.000)
export const formatVND = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "-";
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Helper function để extract error message từ error object
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message || err.message || 'Đã xảy ra lỗi';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định';
};

