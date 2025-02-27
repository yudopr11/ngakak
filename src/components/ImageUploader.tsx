import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  disabled?: boolean;
}

export default function ImageUploader({ 
  imagePreview, 
  onImageSelect, 
  onImageRemove,
  disabled = false 
}: ImageUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const file = rejectedFiles[0];
        if (file.errors?.[0]?.code === 'file-invalid-type') {
          toast.error('Please select an image file (JPEG, PNG, or WebP)', {
            icon: '❌',
            duration: 5000
          });
        } else if (file.errors?.[0]?.code === 'file-too-large') {
          toast.error('File is too large. Maximum size is 5MB', {
            icon: '📁',
            duration: 5000
          });
        }
        return;
      }

      if (acceptedFiles.length === 0) return;
      onImageSelect(acceptedFiles[0]);
    },
    disabled
  });

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Upload Bill Image</h2>
      {!imagePreview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700 hover:border-primary-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">
            {isDragActive
              ? 'Drop the bill image here...'
              : disabled 
                ? 'Image upload disabled during retry'
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
            onClick={onImageRemove}
            disabled={disabled}
            className={`absolute top-2 right-2 p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
} 