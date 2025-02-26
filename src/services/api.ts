import axios from 'axios';
import axiosInstance from './axiosConfig';


export interface BillAnalysisResponse {
  split_details: {
    [person_name: string]: {
      items: Array<{
        item: string;
        price: number;
      }>;
      individual_total: number;
      vat_share: number;
      other_share: number;
      discount_share: number;
      final_total: number;
    };
  };
  total_bill: number;
  subtotal: number;
  subtotal_vat: number;
  subtotal_other: number;
  subtotal_discount: number;
  currency: string;
}

export const analyzeBill = async (image: File, description: string, token: string): Promise<BillAnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('description', description);

  try {
    const response = await axiosInstance.post<BillAnalysisResponse>(
      '/splitbill/analyze',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 5 * 60 * 1000, // 5 minutes = 5 * 60 seconds * 1000 milliseconds
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.detail || error.message;

      // Don't handle 401 here as it's handled by the interceptor
      switch (status) {
        case 400:
          throw new Error('Invalid bill image. Please make sure the image is clear and readable.');
        case 413:
          throw new Error('File size too large. Maximum size allowed is 5MB.');
        case 415:
          throw new Error('File type not allowed. Only JPEG, PNG, and WebP images are supported.');
        case 422:
          throw new Error(`Validation error: ${errorMessage}`);
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error('Failed to analyze bill. Please try again.');
      }
    }
    throw new Error('Failed to analyze bill. Please check your connection and try again.');
  }
}; 