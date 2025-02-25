import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { analyzeBill } from '../services/api';
import { getToken } from '../services/auth';
import type { BillAnalysisResponse } from '../services/api';
import html2canvas from 'html2canvas';
import ImageUploader from './ImageUploader';
import BillAnalysis from './BillAnalysis';

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

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
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
      toast.success('Bill analyzed successfully!', {
        duration: 3000,
        icon: '✅'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze bill';
      
      if (errorMessage.includes('Invalid bill image')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '🖼️'
        });
      } else if (errorMessage.includes('session has expired')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '🔒'
        });
      } else if (errorMessage.includes('File size too large')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '📁'
        });
      } else if (errorMessage.includes('File type not allowed')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '❌'
        });
      } else if (errorMessage.includes('Validation error')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '⚠️'
        });
      } else if (errorMessage.includes('Server error')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '🔧'
        });
      } else if (errorMessage.includes('check your connection')) {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '📡'
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
          icon: '❗'
        });
      }
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

            // Fix SVG icons
            element.querySelectorAll('svg').forEach(svg => {
              svg.setAttribute('width', '20');
              svg.setAttribute('height', '20');
              svg.setAttribute('viewBox', '0 0 20 20');
              svg.style.display = 'block';
              
              svg.querySelectorAll('path').forEach(path => {
                path.setAttribute('stroke', 'rgb(156, 163, 175)'); // text-gray-400
                path.setAttribute('stroke-width', '2');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');
                path.setAttribute('fill', 'none');
              });
            });

            // Fix collapse icons specifically
            element.querySelectorAll('.rotate-180').forEach(el => {
              const parentDiv = el as HTMLElement;
              parentDiv.style.transform = 'rotate(180deg)';
              parentDiv.style.transformOrigin = 'center';
              parentDiv.style.display = 'inline-block';
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
    <div className="space-y-6 pb-8">
      <ImageUploader
        imagePreview={imagePreview}
        onImageSelect={handleImageSelect}
        onImageRemove={handleReset}
      />

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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!analysis ? (
          renderInputForm()
        ) : (
          <BillAnalysis
            ref={analysisRef}
            analysis={analysis}
            imagePreview={imagePreview}
            onReset={handleReset}
            onSaveImage={handleSaveImage}
          />
        )}
      </div>
    </div>
  );
} 