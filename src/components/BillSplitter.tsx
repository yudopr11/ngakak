import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { analyzeBill } from '../services/api';
import { getToken } from '../services/auth';
import type { BillAnalysisResponse } from '../services/api';
import CurrencyDisplay from './CurrencyDisplay';
import html2canvas from 'html2canvas';

export default function BillSplitter() {
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysisResponse | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

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

  const handleSaveImage = async () => {
    if (!analysisRef.current || !analysis) return;
    
    try {
      const canvas = await html2canvas(analysisRef.current, {
        backgroundColor: '#0f172a', // Tailwind slate-900
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const element = clonedDoc.querySelector('[data-analysis="true"]');
          if (element) {
            // Fix disclaimer card
            const disclaimer = element.querySelector('.card.bg-yellow-900\\/20');
            if (disclaimer) {
              (disclaimer as HTMLElement).style.backgroundColor = 'rgba(113, 63, 18, 0.2)';
              (disclaimer as HTMLElement).style.borderColor = 'rgba(202, 138, 4, 0.3)';
            }

            // Fix bill summary cards
            element.querySelectorAll('.bg-gray-900\\/50').forEach(el => {
              (el as HTMLElement).style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
            });

            // Fix person share cards
            element.querySelectorAll('.bg-gray-900').forEach(el => {
              (el as HTMLElement).style.backgroundColor = '#111827';
            });

            // Fix regular cards
            element.querySelectorAll('.card:not(.bg-yellow-900\\/20)').forEach(el => {
              (el as HTMLElement).style.backgroundColor = '#1e293b';
              (el as HTMLElement).style.borderRadius = '0.5rem';
              (el as HTMLElement).style.padding = '1rem';
            });

            // Fix image overlay gradient
            const overlay = element.querySelector('.from-gray-900\\/50');
            if (overlay) {
              (overlay as HTMLElement).style.background = 'linear-gradient(to top, rgba(17, 24, 39, 0.5), transparent)';
            }

            // Fix text colors
            element.querySelectorAll('.text-gray-300').forEach(el => {
              (el as HTMLElement).style.color = 'rgb(209, 213, 219)';
            });
            element.querySelectorAll('.text-gray-400').forEach(el => {
              (el as HTMLElement).style.color = 'rgb(156, 163, 175)';
            });
            element.querySelectorAll('.text-primary-400').forEach(el => {
              (el as HTMLElement).style.color = '#60a5fa';
            });
            element.querySelectorAll('.text-yellow-500').forEach(el => {
              (el as HTMLElement).style.color = 'rgb(234, 179, 8)';
            });

            // Fix font weights
            element.querySelectorAll('.font-semibold').forEach(el => {
              (el as HTMLElement).style.fontWeight = '600';
            });
            element.querySelectorAll('.font-bold').forEach(el => {
              (el as HTMLElement).style.fontWeight = '700';
            });

            // Fix spacing
            element.querySelectorAll('.space-y-4').forEach(el => {
              (el as HTMLElement).style.rowGap = '1rem';
              (el as HTMLElement).style.display = 'flex';
              (el as HTMLElement).style.flexDirection = 'column';
            });
          }
        }
      });
      
      // Convert to JPG with 90% quality for better text clarity
      const jpgImage = canvas.toDataURL('image/jpeg', 0.9);
      
      const link = document.createElement('a');
      link.download = `bill-analysis-${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = jpgImage;
      link.click();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
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

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="btn-primary text-sm md:text-base"
          >
            Process Another Bill
          </button>
        </div>

        <div ref={analysisRef} data-analysis="true" className="space-y-4">
          <div className="card bg-yellow-900/20 border border-yellow-600/30">
            <div className="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-base md:text-lg font-medium text-yellow-500">AI Analysis Disclaimer</h3>
                <p className="text-xs md:text-sm text-gray-300 mt-1">
                  AI can make mistakes in analysis. Please double-check the calculations with the original receipt to ensure accurate cost distribution.
                </p>
              </div>
            </div>
          </div>

          {imagePreview && (
            <div className="card">
              <h2 className="text-base md:text-lg font-semibold mb-4">Original Bill Image</h2>
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
            <h2 className="text-base md:text-lg font-semibold mb-6">Bill Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Total Bill</p>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-gray-300">{analysis?.currency || 'IDR'}</p>
                  <CurrencyDisplay 
                    amount={analysis?.total_bill || 0}
                    currency=""
                    className="text-lg md:text-2xl font-bold text-white"
                  />
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Subtotal</p>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-gray-300">{analysis?.currency || 'IDR'}</p>
                  <CurrencyDisplay 
                    amount={analysis?.subtotal || 0}
                    currency=""
                    className="text-lg md:text-2xl font-bold text-white"
                  />
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">VAT</p>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-gray-300">{analysis?.currency || 'IDR'}</p>
                  <CurrencyDisplay 
                    amount={analysis?.subtotal_vat || 0}
                    currency=""
                    className="text-lg md:text-2xl font-bold text-white"
                  />
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Other Charges</p>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-gray-300">{analysis?.currency || 'IDR'}</p>
                  <CurrencyDisplay 
                    amount={analysis?.subtotal_other || 0}
                    currency=""
                    className="text-lg md:text-2xl font-bold text-white"
                  />
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Discounts</p>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-gray-300">{analysis?.currency || 'IDR'}</p>
                  <CurrencyDisplay 
                    amount={analysis?.subtotal_discount || 0}
                    currency=""
                    className="text-lg md:text-2xl font-bold text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(analysis?.split_details || {}).map(([person, details]) => (
              <div key={person} className="card">
                <h3 className="text-base md:text-lg font-semibold mb-4">{person}'s Share</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-3 md:p-4">
                    <div className="flex justify-between text-xs md:text-sm font-medium text-gray-400 mb-2">
                      <h4>Items</h4>
                      <h4>Price</h4>
                    </div>
                    <ul className="space-y-1 md:space-y-2">
                      {details.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-xs md:text-sm">
                          <span className="mr-4">{item.item}</span>
                          <CurrencyDisplay 
                            amount={item.price}
                            currency={analysis?.currency || ''}
                            className="text-xs md:text-sm"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-400">Items Total</p>
                      <CurrencyDisplay 
                        amount={details.individual_total}
                        currency={analysis?.currency || ''}
                        className="text-xs md:text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-400">VAT Share</p>
                      <CurrencyDisplay 
                        amount={details.vat_share}
                        currency={analysis?.currency || ''}
                        className="text-xs md:text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-400">Other Share</p>
                      <CurrencyDisplay 
                        amount={details.other_share}
                        currency={analysis?.currency || ''}
                        className="text-xs md:text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-400">Discount Share</p>
                      <CurrencyDisplay 
                        amount={details.discount_share}
                        currency={analysis?.currency || ''}
                        className="text-xs md:text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-400">Final Total</p>
                      <CurrencyDisplay 
                        amount={details.final_total}
                        currency={analysis?.currency || ''}
                        className="text-xs md:text-sm font-bold text-primary-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8 pb-8">
          <button
            onClick={handleSaveImage}
            className="btn btn-primary flex items-center space-x-2 text-sm md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Save Analysis as Image</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!analysis ? renderInputForm() : renderAnalysis()}
      </div>
    </div>
  );
} 