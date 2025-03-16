import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { analyzeBill } from '../services/api';
import { getToken } from '../services/auth';
import type { BillAnalysisResponse } from '../services/api';
import html2canvas from 'html2canvas';
import ImageUploader from './ImageUploader';
import BillAnalysis from './BillAnalysis';

// Constants for guest usage tracking
const GUEST_USAGE_KEY = 'guest_bill_analyses';
const GUEST_USAGE_LIMIT = 3;

interface GuestUsage {
  date: string;
  count: number;
}

export default function BillSplitter() {
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysisResponse | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [savedImageDescription, setSavedImageDescription] = useState<string | undefined>(undefined);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const analysisRef = useRef<HTMLDivElement>(null);

  // Check if the user is a guest and track their usage
  useEffect(() => {
    const token = getToken();
    // A simple way to check if it's the guest account - in a real app, you might want to use a more robust method
    if (token) {
      try {
        // Decode JWT to check if it's the guest user (simplified example)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const isGuest = payload.sub === 'guest';
          setIsGuestUser(isGuest);
          
          if (isGuest) {
            checkGuestUsage();
          }
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Track guest usage
  const checkGuestUsage = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storedUsage = localStorage.getItem(GUEST_USAGE_KEY);
    
    let usage: GuestUsage;
    
    if (storedUsage) {
      usage = JSON.parse(storedUsage);
      // Reset counter if it's a new day
      if (usage.date !== today) {
        usage = { date: today, count: 0 };
      }
    } else {
      usage = { date: today, count: 0 };
    }
    
    setGuestUsageCount(usage.count);
  };

  // Increment guest usage counter
  const incrementGuestUsage = () => {
    if (!isGuestUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    const storedUsage = localStorage.getItem(GUEST_USAGE_KEY);
    
    let usage: GuestUsage;
    
    if (storedUsage) {
      usage = JSON.parse(storedUsage);
      // Reset counter if it's a new day
      if (usage.date !== today) {
        usage = { date: today, count: 1 };
      } else {
        usage.count += 1;
      }
    } else {
      usage = { date: today, count: 1 };
    }
    
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify(usage));
    setGuestUsageCount(usage.count);
    
    // Check if limit reached after this analysis
    if (usage.count >= GUEST_USAGE_LIMIT) {
      toast.error(`You've reached the daily limit (${GUEST_USAGE_LIMIT}) for bill analyses as a guest user.`, {
        duration: 6000,
        icon: '⚠️'
      });
    }
  };

  const handleReset = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setDescription('');
    setAnalysis(null);
    setIsRetrying(false);
    setSavedImageDescription(undefined);
  };

  const handleRetry = () => {
    if (analysis?.image_description) {
      setSavedImageDescription(analysis.image_description);
    }
    setDescription('');
    setAnalysis(null);
    setIsRetrying(true);
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

    // Check guest usage limit before proceeding
    if (isGuestUser && guestUsageCount >= GUEST_USAGE_LIMIT) {
      toast.error(`Daily limit reached (${GUEST_USAGE_LIMIT}). Please try again tomorrow or create an account.`, {
        duration: 5000,
        icon: '⚠️'
      });
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    // Increment guest usage if it's a guest user - count each click, not just successful analyses
    if (isGuestUser) {
      incrementGuestUsage();
    }

    setIsLoading(true);
    try {
      const imageDescription = isRetrying ? savedImageDescription : undefined;
      
      const result = await analyzeBill(selectedImage, description, token, imageDescription);
      setAnalysis(result);
      setIsRetrying(false);
      setSavedImageDescription(undefined);
      
      toast.success('Bill analyzed successfully!', {
        duration: 3000,
        icon: '✅'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze bill';
      
      // If it's a 429 response, it means the user has reached their limit
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
        // For a guest user, update the count to the max limit
        if (isGuestUser) {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: today, count: GUEST_USAGE_LIMIT }));
          setGuestUsageCount(GUEST_USAGE_LIMIT);
        }
        
        toast.error('You have reached your daily analysis limit. Please try again tomorrow.', {
          duration: 5000,
          icon: '⏳'
        });
      } else if (errorMessage.includes('Invalid bill image')) {
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
              const originalViewBox = svg.getAttribute('viewBox') || '0 0 20 20';
              svg.setAttribute('width', '20');
              svg.setAttribute('height', '20');
              svg.setAttribute('viewBox', originalViewBox);
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
        disabled={isRetrying}
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

      {isGuestUser && (
        <div className="card bg-blue-900/20 border border-blue-600/30 mb-4">
          <div className="flex items-start space-x-3">
            <div>
              <h3 className="text-base font-medium text-blue-400">Guest Account</h3>
              <p className="text-xs text-gray-300 mt-1">
                You have used {guestUsageCount} of {GUEST_USAGE_LIMIT} bill analyses today.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !selectedImage || !description.trim() || (isGuestUser && guestUsageCount >= GUEST_USAGE_LIMIT)}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing...</span>
          </div>
        ) : (
          isRetrying ? 'Retry Analysis' : 'Analyze Bill'
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
            onRetry={handleRetry}
            onSaveImage={handleSaveImage}
          />
        )}
      </div>
    </div>
  );
} 