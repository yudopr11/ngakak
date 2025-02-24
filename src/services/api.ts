import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface BillAnalysisResponse {
  split_details: {
    [key: string]: {
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
  total_vat: number;
  total_other: number;
  total_discount: number;
  currency: string;
}

export const analyzeBill = async (image: File, description: string, token: string): Promise<BillAnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('description', description);

  try {
    const response = await axios.post<BillAnalysisResponse>(
      `${API_BASE_URL}/splitbill/analyze`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 413) {
        throw new Error('File size too large. Maximum size allowed is 5MB');
      } else if (error.response?.status === 415) {
        throw new Error('File type not allowed. Only image/jpeg, image/png, image/jpg, image/webp are allowed');
      }
    }
    throw new Error('Failed to analyze bill');
  }
}; 