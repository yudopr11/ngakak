import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { analyzeBill } from '../services/api';
import { getToken } from '../services/auth';
import type { BillAnalysisResponse } from '../services/api';
import CurrencyDisplay from './CurrencyDisplay';

export default function BillSplitter() {
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysisResponse | null>(null);

  const handleReset = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setDescription('');
    setAnalysis(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  });

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !description.trim()) {
      toast.error('Please provide both an image and description');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeBill(selectedImage, description, token);
      setAnalysis(result);
      toast.success('Bill analyzed successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to analyze bill');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputForm = () => (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Upload Bill Image</h2>
        {!imagePreview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700 hover:border-primary-500'}`}
          >
            <input {...getInputProps()} />
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">
              {isDragActive
                ? 'Drop the bill image here...'
                : 'Drag & drop a bill image, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: JPEG, PNG, WebP (max 5MB)
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Bill preview"
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <textarea
          className="input-field"
          placeholder="Example:&#10;Alice ordered:&#10;- Nasi Goreng Special&#10;- Es Teh Manis&#10;&#10;Bob ordered:&#10;- Mie Goreng&#10;- Juice Alpukat&#10;- Extra Kerupuk"
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !selectedImage || !description.trim()}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing...</span>
          </div>
        ) : (
          'Analyze Bill'
        )}
      </button>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="btn-primary"
        >
          Process Another Bill
        </button>
      </div>

      <div className="card bg-yellow-900/20 border border-yellow-600/30">
        <div className="flex items-start space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-yellow-500">AI Analysis Disclaimer</h3>
            <p className="text-gray-300 mt-1">
              AI can make mistakes in analysis. Please double-check the calculations with the original receipt to ensure accurate cost distribution.
            </p>
          </div>
        </div>
      </div>

      {imagePreview && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Original Bill Image</h2>
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Original bill"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none" />
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400">Total Bill</p>
            <CurrencyDisplay 
              amount={analysis?.total_bill || 0}
              currency={analysis?.currency || ''}
              className="text-2xl font-bold"
            />
          </div>
          <div>
            <p className="text-gray-400">VAT</p>
            <CurrencyDisplay 
              amount={analysis?.total_vat || 0}
              currency={analysis?.currency || ''}
              className="text-2xl font-bold"
            />
          </div>
          <div>
            <p className="text-gray-400">Other Charges</p>
            <CurrencyDisplay 
              amount={analysis?.total_other || 0}
              currency={analysis?.currency || ''}
              className="text-2xl font-bold"
            />
          </div>
          <div>
            <p className="text-gray-400">Discounts</p>
            <CurrencyDisplay 
              amount={analysis?.total_discount || 0}
              currency={analysis?.currency || ''}
              className="text-2xl font-bold"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(analysis?.split_details || {}).map(([person, details]) => (
          <div key={person} className="card">
            <h3 className="text-lg font-semibold mb-4">{person}'s Share</h3>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                  <h4>Items</h4>
                  <h4>Price</h4>
                </div>
                <ul className="space-y-2">
                  {details.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.item}</span>
                      <CurrencyDisplay 
                        amount={item.price}
                        currency={analysis?.currency || ''}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Items Total</p>
                  <CurrencyDisplay 
                    amount={details.individual_total}
                    currency={analysis?.currency || ''}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <p className="text-gray-400">VAT Share</p>
                  <CurrencyDisplay 
                    amount={details.vat_share}
                    currency={analysis?.currency || ''}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <p className="text-gray-400">Other Share</p>
                  <CurrencyDisplay 
                    amount={details.other_share}
                    currency={analysis?.currency || ''}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <p className="text-gray-400">Discount Share</p>
                  <CurrencyDisplay 
                    amount={details.discount_share}
                    currency={analysis?.currency || ''}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <p className="text-gray-400">Final Total</p>
                  <CurrencyDisplay 
                    amount={details.final_total}
                    currency={analysis?.currency || ''}
                    className="font-semibold text-primary-400"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!analysis ? renderInputForm() : renderAnalysis()}
    </div>
  );
} 