'use client'

import { useState, useRef, useEffect } from 'react'
import ImageUpload from '../components/ImageUpload'
import TextWatermarkSettings from '../components/TextWatermarkSettings'
import WatermarkSettings from '../components/WatermarkSettings'
import EditTextDialog from '../components/EditTextDialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const styles = `
    .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none;  /* Chrome, Safari and Opera */
    }
`;

function wrapText(text, maxCharsPerLine) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';
    words.forEach((word) => {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
            currentLine = (currentLine + ' ' + word).trim();
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
}

export default function Home() {
    const [step, setStep] = useState(1)
    const [poemModel, setPoemModel] = useState('')
    const [imageModel, setImageModel] = useState('')
    const [useAIImage, setUseAIImage] = useState(false)
    const [category, setCategory] = useState('')
    const [recipientName, setRecipientName] = useState('')
    const [recipientDescription, setRecipientDescription] = useState('')
    const [greeting, setGreeting] = useState('')
    const [poem, setPoem] = useState('')
    const [image, setImage] = useState(null)
    const [watermarkText, setWatermarkText] = useState('Happy Birthday!')
    const [textSize, setTextSize] = useState(30)
    const [textColor, setTextColor] = useState('#ffffff')
    const [textXRatio, setTextXRatio] = useState(0.5)
    const [textYRatio, setTextYRatio] = useState(0.5)
    const [poemFontSize, setPoemFontSize] = useState(30)
    const [poemColor, setPoemColor] = useState('#000000')
    const [contrast, setContrast] = useState(100)
    const [grayscale, setGrayscale] = useState(0)
    const [borderWidth, setBorderWidth] = useState(5)
    const [borderColor, setBorderColor] = useState('#ff0000')
    const [borderType, setBorderType] = useState('solid')
    const [overlayImage, setOverlayImage] = useState(null)
    const [overlayOpacity, setOverlayOpacity] = useState(50)
    const [overlayXRatio, setOverlayXRatio] = useState(0.5)
    const [overlayYRatio, setOverlayYRatio] = useState(0.5)
    const [overlayWidth, setOverlayWidth] = useState(100)
    const [overlayBorderRadius, setOverlayBorderRadius] = useState(0)
    const [originalImageDimensions, setOriginalImageDimensions] = useState(null)
    const [imagePrompt, setImagePrompt] = useState('')
    const [message, setMessage] = useState(null)
    const [showWatermarked, setShowWatermarked] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)
    const previewContainerRef = useRef(null)
    const overlayRef = useRef(null)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [occasion, setOccasion] = useState('birthday')

    const getImageDimensions = () => {
        return { width: 525, height: 744 };
    }

    const compressImage = async (file, targetWidth = 525, targetHeight = 744) => {
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => (img.onload = resolve));
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const targetAspect = targetWidth / targetHeight;
        let srcWidth, srcHeight, srcX, srcY;

        if (aspectRatio > targetAspect) {
            srcHeight = img.naturalHeight;
            srcWidth = img.naturalHeight * targetAspect;
            srcX = (img.naturalWidth - srcWidth) / 2;
            srcY = 0;
        } else {
            srcWidth = img.naturalWidth;
            srcHeight = img.naturalWidth / targetAspect;
            srcX = 0;
            srcY = (img.naturalHeight - srcHeight) / 2;
        }

        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, targetWidth, targetHeight);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to create PNG blob'));
            }, 'image/jpeg', 0.8);
        });
    }

    const handleImageUpload = async (file) => {
        if (file.size > 4 * 1024 * 1024) {
            setMessage({ title: 'Error', text: 'Image file is too large. Please use an image under 4MB.' });
            return;
        }
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });
        console.log('Original uploaded image dimensions:', {
            width: img.naturalWidth,
            height: img.naturalHeight
        });
        const previewBlob = await compressImage(file);
        const previewUrl = URL.createObjectURL(previewBlob);
        setImage({
            id: 'preview_' + Math.random().toString(36).substr(2, 9),
            file,
            preview: previewUrl,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
        });
        setOriginalImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
        setUseAIImage(false);
        setStep(5);
        setShowWatermarked(false);
    }

    const handleOverlayImage = async (file) => {
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ title: 'Error', text: 'Overlay image is too large. Please use an image under 2MB.' });
            return;
        }
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });

        // Create a higher quality preview for the overlay
        const canvas = document.createElement('canvas');
        const maxDimension = Math.max(img.naturalWidth, img.naturalHeight);
        const scale = Math.min(1, 200 / maxDimension); // Scale down if larger than 200px
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const previewBlob = await new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else throw new Error('Failed to create preview blob');
            }, 'image/png', 1.0); // Use PNG with maximum quality
        });

        const previewUrl = URL.createObjectURL(previewBlob);
        setOverlayImage({
            id: 'overlay_' + Math.random().toString(36).substr(2, 9),
            file,
            preview: previewUrl,
            aspectRatio: img.naturalWidth / img.naturalHeight,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
        });
    }

    const handleShowFinalPreview = async () => {
        if (!image) {
            setMessage({ title: 'Error', text: 'Please select or upload an image first.' });
            return null;
        }
        setPreviewLoading(true);
        try {
            let imageFile;
            if (image.file) {
                const compressedBlob = await compressImage(image.file);
                if (!compressedBlob) {
                    throw new Error('Failed to compress image');
                }
                imageFile = new File([compressedBlob], 'card.jpg', { type: 'image/jpeg' });
            } else if (image.preview && useAIImage) {
                if (!image.preview.startsWith('data:image/')) {
                    throw new Error('Invalid AI-generated image format');
                }
                const base64Data = image.preview.split(',')[1];
                const binary = atob(base64Data);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([array], { type: 'image/jpeg' });
                imageFile = new File([blob], 'ai-card.jpg', { type: 'image/jpeg' });
            } else {
                throw new Error('No valid image source');
            }

            let overlayFile = null;
            if (overlayImage?.file) {
                const compressedBlob = await compressImage(overlayImage.file, overlayWidth, overlayWidth / (overlayImage.aspectRatio || 1));
                if (!compressedBlob) {
                    throw new Error('Failed to compress overlay image');
                }
                overlayFile = new File([compressedBlob], 'overlay.jpg', { type: 'image/jpeg' });
                console.log('Sending overlay image to /api/watermark:', {
                    name: overlayFile.name,
                    size: overlayFile.size,
                });
            }

            const { width, height } = getImageDimensions();
            const lines = wrapText(watermarkText, Math.floor((width - 60 * 2) / (textSize * 0.65)));
            const textHeight = lines.length * textSize * 1.5;
            const formData = new FormData();
            formData.append('image', imageFile);
            if (overlayFile) formData.append('overlay_image', overlayFile);
            formData.append('watermark_text', watermarkText);
            formData.append('watermark_x', (textXRatio * width).toString());
            formData.append('watermark_y', ((textYRatio * height) - (textHeight / 2)).toString());
            formData.append('watermark_size', textSize.toString());
            formData.append('watermark_color', textColor);
            formData.append('border_width', borderWidth.toString());
            formData.append('border_color', borderColor);
            formData.append('border_type', borderType);
            formData.append('overlay_opacity', (overlayOpacity / 100).toString());
            formData.append('overlay_x', (overlayXRatio * width).toString());
            formData.append('overlay_y', (overlayYRatio * height).toString());
            formData.append('overlay_width', overlayWidth.toString());
            formData.append('overlay_border_radius', overlayBorderRadius.toString());
            formData.append('contrast', contrast.toString());
            formData.append('grayscale', grayscale.toString());
            formData.append('overlay_aspect_ratio', overlayImage?.aspectRatio?.toString() || '1');

            const response = await fetch('/api/watermark', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setImage((prev) => ({ ...prev, watermarked: data.image_data }));
                setShowWatermarked(true);
                return data.image_data;
            } else {
                setMessage({ title: 'Error', text: data.error || 'Failed to generate preview.' });
                return null;
            }
        } catch (error) {
            console.error('Preview fetch error:', error);
            setMessage({ title: 'Error', text: 'Failed to process the image. Please try again.' });
            return null;
        } finally {
            setPreviewLoading(false);
        }
    }

    const handleGenerateImage = async () => {
        if (!imageModel && useAIImage) {
            setMessage({ title: 'Error', text: 'Please select an image generation model.' });
            return;
        }
        setLoading(true);
        toast.success('Generating Image...');
        try {
            const prompt = imagePrompt || `A ${category} ${occasion} card scene for ${recipientName}, ${recipientDescription || 'celebrating joyfully'}`;
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, model: imageModel }),
            });
            const data = await response.json();
            if (data.imageUrl) {
                const img = new window.Image();
                img.src = data.imageUrl;
                await new Promise((resolve) => { img.onload = resolve; });
                setImage({
                    id: 'ai_' + Math.random().toString(36).substr(2, 9),
                    preview: data.imageUrl,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                });
                setOriginalImageDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
                setUseAIImage(true);
                setStep(5);
                setShowWatermarked(false);
            } else {
                setMessage({ title: 'Error', text: data.error || 'Failed to generate image.' });
            }
        } catch (error) {
            console.error('Image generation error:', error);
            setMessage({ title: 'Error', text: 'An error occurred while generating the image.' });
        } finally {
            setLoading(false);
        }
    }

    const handleGeneratePoem = async () => {
        if (!poemModel) {
            setMessage({ title: 'Error', text: 'Please select a poem generation model.' });
            return false;
        }
        try {
            const response = await fetch('/api/poem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientName,
                    recipientDescription,
                    category,
                    occasion,
                    model: poemModel,
                }),
            });
            const data = await response.json();
            if (data.greeting && data.poem) {
                setGreeting(data.greeting);
                setPoem(data.poem);
                return true;
            } else {
                setMessage({ title: 'Error', text: data.error || 'Failed to generate poem.' });
                return false;
            }
        } catch (error) {
            console.error('Poem generation error:', error);
            setMessage({ title: 'Error', text: 'An error occurred while generating the poem.' });
            return false;
        }
    }

    const handleApplySettings = async () => {
        try {
            const watermarkedImage = await handleShowFinalPreview();
            if (!watermarkedImage || !watermarkedImage.startsWith('data:image/')) {
                console.error('Invalid watermarked image:', watermarkedImage?.slice(0, 50));
                setMessage({ title: 'Error', text: 'Failed to generate a valid watermarked image.' });
                return;
            }

            let imageFile;
            try {
                const imageMimeType = watermarkedImage.match(/^data:(image\/[a-z]+);base64,/)[1] || 'image/jpeg';
                const response = await fetch(watermarkedImage);
                const blob = await response.blob();
                if (!blob) {
                    throw new Error('Failed to process image data');
                }
                imageFile = new File([blob], `watermarked_card.${imageMimeType.split('/')[1]}`, { type: imageMimeType });
            } catch (err) {
                console.error('Failed to process image:', err);
                setMessage({ title: 'Error', text: 'Failed to prepare image for download.' });
                return;
            }

            let overlayFile = null;
            let overlayBase64 = null;
            if (overlayImage?.preview) {
                try {
                    let overlayUrl = overlayImage.preview;
                    if (overlayUrl.startsWith('blob:')) {
                        const response = await fetch(overlayUrl);
                        if (!response.ok) {
                            throw new Error('Failed to fetch overlay blob');
                        }
                        const blob = await response.blob();
                        overlayBase64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    } else if (overlayUrl.match(/^data:image\/[a-z]+;base64,/)) {
                        overlayBase64 = overlayUrl;
                    } else {
                        throw new Error('Invalid overlay image format');
                    }

                    if (!overlayBase64.match(/^data:image\/[a-z]+;base64,/)) {
                        console.error('Invalid overlay base64:', overlayBase64.slice(0, 50));
                        setMessage({ title: 'Error', text: 'Invalid overlay image format.' });
                        return;
                    }

                    const overlayMimeType = overlayBase64.match(/^data:(image\/[a-z]+);base64,/)[1] || 'image/jpeg';
                    const response = await fetch(overlayBase64);
                    const blob = await response.blob();
                    overlayFile = new File([blob], `overlay.${overlayMimeType.split('/')[1]}`, { type: overlayMimeType });
                } catch (err) {
                    console.error('Failed to process overlay image:', err);
                    setMessage({ title: 'Error', text: 'Failed to process overlay image.' });
                    return;
                }
            }

            const cardData = {
                image: watermarkedImage,
                imageFileName: imageFile.name,
                greeting: greeting || '',
                poem: poem || '',
                poemFontSize: poemFontSize || 30,
                poemColor: poemColor || '#000000',
                grayscale: grayscale || 0,
                occasion: occasion || 'card',
                overlayImage: overlayFile ? { preview: overlayBase64 } : null,
                overlayXRatio: overlayXRatio || 0,
                overlayYRatio: overlayYRatio || 0,
                overlayWidth: overlayWidth || 100,
                overlayOpacity: overlayOpacity || 50,
                overlayBorderRadius: overlayBorderRadius || 0,
                watermarkText: watermarkText || '',
                textXRatio: textXRatio || 0,
                textYRatio: textYRatio || 0,
                textSize: textSize || 30,
                textColor: textColor || '#ffffff',
                borderWidth: borderWidth || 0,
                borderColor: borderColor || '#000000',
                borderType: borderType || 'solid',
                contrast: contrast || 100,
                recipientName: recipientName || '',
                originalImageDimensions: originalImageDimensions || { width: 525, height: 744 },
            };

            console.log('Saving cardData:', {
                image: cardData.image?.slice(0, 30),
                overlayImage: cardData.overlayImage?.preview?.slice(0, 30),
                greeting: cardData.greeting,
                poem: cardData.poem,
                recipientName: cardData.recipientName,
            });
            sessionStorage.setItem('cardData', JSON.stringify(cardData));
            router.push('/preview');
        } catch (error) {
            console.error('Error applying settings:', error);
            setMessage({ title: 'Error', text: 'An error occurred while generating the card.' });
        }
    }

    const getEventCoordinates = (e) => {
        if (e.touches && e.touches.length > 0) {
            return {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY,
            };
        }
        return {
            clientX: e.clientX,
            clientY: e.clientY,
        };
    }

    const updateOverlayPosition = (clientX, clientY) => {
        if (!previewContainerRef.current || !overlayImage) return;

        const rect = previewContainerRef.current.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const clampedX = Math.max(0, Math.min(1, x));
        const clampedY = Math.max(0, Math.min(1, y));

        setOverlayXRatio(clampedX);
        setOverlayYRatio(clampedY);
    }

    const handleMouseDown = (e) => {
        if (!overlayImage) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        const { clientX, clientY } = getEventCoordinates(e);
        updateOverlayPosition(clientX, clientY);
    }

    const handleMouseMove = (e) => {
        if (!isDragging || !overlayImage) return;
        e.preventDefault();
        e.stopPropagation();
        const { clientX, clientY } = getEventCoordinates(e);
        updateOverlayPosition(clientX, clientY);
    }

    const handleMouseUp = () => {
        setIsDragging(false);
    }

    const handleTouchStart = (e) => {
        if (!overlayImage) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        const { clientX, clientY } = getEventCoordinates(e);
        updateOverlayPosition(clientX, clientY);
    }

    const handleTouchMove = (e) => {
        if (!isDragging || !overlayImage) return;
        e.preventDefault();
        e.stopPropagation();
        const { clientX, clientY } = getEventCoordinates(e);
        updateOverlayPosition(clientX, clientY);
    }

    const handleTouchEnd = () => {
        setIsDragging(false);
    }

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, overlayImage]);

    useEffect(() => {
        if (overlayImage && previewContainerRef.current) {
            const rect = previewContainerRef.current.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            console.log('Editor overlay positioning:', {
                overlayXRatio,
                overlayYRatio,
                pixelX: overlayXRatio * 525,
                pixelY: overlayYRatio * 744,
                clientPixelX: overlayXRatio * rect.width * dpr,
                clientPixelY: overlayYRatio * rect.height * dpr,
                textXRatio,
                textYRatio,
                overlayWidth,
                container: { width: rect.width, height: rect.height, dpr },
                viewport: { width: window.innerWidth, height: window.innerHeight },
            });
        }
        if (watermarkText) {
            const lines = wrapText(watermarkText, Math.floor((525 - 50 * 2) / (textSize * 0.6)));
            const textHeight = lines.length * textSize * 1.5;
            console.log('Editor text positioning:', {
                textXRatio,
                textYRatio,
                pixelX: textXRatio * 525,
                pixelY: textYRatio * 744,
                textSize,
                watermarkText,
                textHeight,
                adjustedWatermarkY: (textYRatio * 744) - (textHeight / 2),
            });
        }
    }, [overlayImage, watermarkText, textXRatio, textYRatio, textSize, overlayXRatio, overlayYRatio, overlayWidth]);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const scaledFontSize = Math.min(poemFontSize, 60);
    const greetingFontSize = scaledFontSize * 1.2;
    const padding = 48;
    const approxCharWidth = scaledFontSize * 0.6;
    const maxCharsPerLine = Math.floor((525 - (padding * 2)) / approxCharWidth);
    const wrappedGreeting = greeting ? wrapText(greeting, maxCharsPerLine) : [];
    const wrappedPoem = poem ? wrapText(poem, maxCharsPerLine) : ['Poem will appear here'];
    const greetingText = wrappedGreeting.join('\n');
    const poemText = wrappedPoem.join('\n');

    const overlayImageStyle = {
        width: `${overlayWidth}px`,
        height: `${overlayWidth / (overlayImage?.aspectRatio || 1)}px`,
        left: `${overlayXRatio * 100}%`,
        top: `${overlayYRatio * 100}%`,
        transform: 'translate(-50%, -50%)',
        opacity: overlayOpacity / 100,
        borderRadius: `${overlayBorderRadius}px`,
        filter: `grayscale(${grayscale}%)`,
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserDrag: 'none',
        zIndex: 10,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'absolute',
    };

    const getOverlaySizePercentage = () => {
        return (overlayWidth / 525) * 100;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-semibold text-center">Card Maker</h1>
                </div>
            </header>
            <main className="container mx-auto px-4 py-6">
                {step === 1 && (
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4">Step 1: Select Models</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="poemModel" className="block text-sm font-medium text-gray-700">Poem Generation Model</label>
                                <select
                                    id="poemModel"
                                    value={poemModel}
                                    onChange={(e) => setPoemModel(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a poem model</option>
                                    <option value="gemini">Gemini</option>
                                    <option value="openrouter">OpenRouter</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="useAIImage" className="block text-sm font-medium text-gray-700">Use AI-Generated Image?</label>
                                <select
                                    id="useAIImage"
                                    value={useAIImage ? 'yes' : 'no'}
                                    onChange={(e) => setUseAIImage(e.target.value === 'yes')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="no">No (Upload Image)</option>
                                    <option value="yes">Yes (AI-Generated)</option>
                                </select>
                            </div>
                            {useAIImage && (
                                <div>
                                    <label htmlFor="imageModel" className="block text-sm font-medium text-gray-700">Image Generation Model</label>
                                    <select
                                        id="imageModel"
                                        value={imageModel}
                                        onChange={(e) => setImageModel(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Choose an image model</option>
                                        <option value="replicate">Replicate</option>
                                        <option value="aigurulab">AI Guru Lab</option>
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    if (!poemModel || (useAIImage && !imageModel)) {
                                        setMessage({ title: 'Error', text: 'Please select all required models.' });
                                        return;
                                    }
                                    setStep(2);
                                }}
                                className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4">Step 2: Select Card Occasion and Category</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="occasion" className="block text-sm font-medium text-gray-700">Occasion</label>
                                <select
                                    id="occasion"
                                    value={occasion}
                                    onChange={(e) => setOccasion(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Choose an occasion</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="christmas">Christmas</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="anniversary">Anniversary</option>
                                    <option value="friendship">Friendship</option>
                                    <option value="postcard">Postcard</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setStep(3);
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Choose a category</option>
                                    <option value="funny">Humorous</option>
                                    <option value="heartfelt">Heartfelt</option>
                                    <option value="elegant">Elegant</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4">Step 3: Recipient Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">Recipient Name</label>
                                <input
                                    id="recipientName"
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="recipientDescription" className="block text-sm font-medium text-gray-700">Brief Description</label>
                                <textarea
                                    id="recipientDescription"
                                    value={recipientDescription}
                                    onChange={(e) => setRecipientDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., Loves hiking and coffee"
                                    rows={4}
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (!recipientName) {
                                        setMessage({ title: 'Error', text: 'Please enter a recipient name.' });
                                        return;
                                    }
                                    const success = await handleGeneratePoem();
                                    if (success) {
                                        setStep(4);
                                    }
                                }}
                                className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4">Step 4: Choose Image</h2>
                        <div className="space-y-4">
                            {useAIImage && (
                                <div>
                                    <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700">Image Description</label>
                                    <input
                                        id="imagePrompt"
                                        type="text"
                                        value={imagePrompt}
                                        onChange={(e) => setImagePrompt(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g., A cheerful birthday scene with balloons"
                                    />
                                </div>
                            )}
                            {useAIImage && (
                                <button
                                    onClick={handleGenerateImage}
                                    className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
                                    disabled={loading}
                                >
                                    {loading ? 'Generating...' : 'Generate AI Image'}
                                </button>
                            )}
                            {loading && (
                                <div className="flex items-center justify-center mt-4">
                                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {!useAIImage && <ImageUpload onUpload={handleImageUpload} />}
                        </div>
                    </div>
                )}
                {step === 5 && (
                    <div className="space-y-6">
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                                <h2 className="text-lg font-semibold">Card Preview</h2>
                            </div>
                            <div className="p-4">
                                {image && image.preview ? (
                                    <div className="flex flex-col md:flex-row gap-2 justify-center max-w-[1200px] mx-auto">
                                        <div className="w-full md:w-1/2">
                                            <div
                                                ref={previewContainerRef}
                                                className="relative bg-white mx-auto"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '525px',
                                                    aspectRatio: '525/744',
                                                    border: borderWidth > 0
                                                        ? `${borderWidth}px ${borderType} ${borderColor}`
                                                        : 'none',
                                                }}
                                            >
                                                <img
                                                    src={showWatermarked && image.watermarked ? image.watermarked : image.preview}
                                                    alt="Card Preview"
                                                    className="w-full h-full object-cover"
                                                    style={{
                                                        filter: `contrast(${contrast}%) grayscale(${grayscale}%)`,
                                                    }}
                                                />
                                                {watermarkText && (
                                                    <div
                                                        className="absolute whitespace-pre-wrap text-center"
                                                        style={{
                                                            left: `${textXRatio * 100}%`,
                                                            top: `${textYRatio * 100}%`,
                                                            fontSize: `${textSize}px`,
                                                            color: textColor,
                                                            pointerEvents: 'none',
                                                            transform: 'translate(-50%, -50%)',
                                                            maxWidth: '90%',
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                            lineHeight: '1.5',
                                                            fontFamily: 'Arial, sans-serif',
                                                        }}
                                                    >
                                                        {wrapText(watermarkText, Math.floor((525 - 48 * 2) / (textSize * 0.6))).join('\n')}
                                                    </div>
                                                )}
                                                {overlayImage && overlayImage.preview && (
                                                    <img
                                                        ref={overlayRef}
                                                        src={overlayImage.preview}
                                                        alt="Overlay"
                                                        className="absolute select-none"
                                                        style={{
                                                            width: `${getOverlaySizePercentage()}%`,
                                                            height: 'auto',
                                                            aspectRatio: overlayImage?.aspectRatio || 1,
                                                            left: `${overlayXRatio * 100}%`,
                                                            top: `${overlayYRatio * 100}%`,
                                                            transform: 'translate(-50%, -50%)',
                                                            opacity: overlayOpacity / 100,
                                                            borderRadius: `${overlayBorderRadius}px`,
                                                            filter: `grayscale(${grayscale}%)`,
                                                            pointerEvents: 'auto',
                                                            userSelect: 'none',
                                                            WebkitUserSelect: 'none',
                                                            WebkitTouchCallout: 'none',
                                                            WebkitUserDrag: 'none',
                                                            zIndex: 10,
                                                            touchAction: 'none',
                                                            cursor: isDragging ? 'grabbing' : 'grab',
                                                            position: 'absolute',
                                                        }}
                                                        onMouseDown={handleMouseDown}
                                                        onTouchStart={handleTouchStart}
                                                        draggable={false}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <div
                                                className="relative bg-white mx-auto p-6 overflow-y-auto scrollbar-hide"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '525px',
                                                    aspectRatio: '525/744',
                                                    border: borderWidth > 0
                                                        ? `${borderWidth}px ${borderType} ${borderColor}`
                                                        : 'none',
                                                    msOverflowStyle: 'none',
                                                    scrollbarWidth: 'none',
                                                }}
                                            >
                                                <div
                                                    className="whitespace-pre-wrap text-center"
                                                    style={{
                                                        fontFamily: 'Arial, sans-serif',
                                                        color: grayscale > 0 ? '#000000' : poemColor,
                                                        width: '100%',
                                                    }}
                                                >
                                                    {greetingText && (
                                                        <div
                                                            style={{
                                                                fontSize: `${greetingFontSize}px`,
                                                                fontWeight: 'bold',
                                                                marginBottom: `${greetingFontSize * 0.3}px`,
                                                                width: '100%',
                                                            }}
                                                        >
                                                            {greetingText}
                                                        </div>
                                                    )}
                                                    <span style={{
                                                        fontSize: `${scaledFontSize}px`,
                                                        display: 'block',
                                                        width: '100%',
                                                    }}>
                                                        {poemText}
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-2 right-2">
                                                    <EditTextDialog
                                                        greeting={greeting}
                                                        setGreeting={setGreeting}
                                                        poem={poem}
                                                        setPoem={setPoem}
                                                        recipientName={recipientName}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center">
                                        {image ? 'Invalid image data' : 'No image selected'}
                                    </p>
                                )}
                                {previewLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextWatermarkSettings
                                watermarkText={watermarkText}
                                setWatermarkText={setWatermarkText}
                                textSize={textSize}
                                setTextSize={setTextSize}
                                textColor={textColor}
                                setTextColor={setTextColor}
                                textXRatio={textXRatio}
                                setTextXRatio={setTextXRatio}
                                textYRatio={textYRatio}
                                setTextYRatio={setTextYRatio}
                            />
                            <WatermarkSettings
                                overlayImage={overlayImage}
                                setOverlayImage={setOverlayImage}
                                onUploadOverlay={handleOverlayImage}
                                overlayOpacity={overlayOpacity}
                                setOverlayOpacity={setOverlayOpacity}
                                overlayWidth={overlayWidth}
                                setOverlayWidth={setOverlayWidth}
                                overlayBorderRadius={overlayBorderRadius}
                                setOverlayBorderRadius={setOverlayBorderRadius}
                                borderWidth={borderWidth}
                                setBorderWidth={setBorderWidth}
                                borderColor={borderColor}
                                setBorderColor={setBorderColor}
                                borderType={borderType}
                                setBorderType={setBorderType}
                                contrast={contrast}
                                setContrast={setContrast}
                                grayscale={grayscale}
                                setGrayscale={setGrayscale}
                                poemFontSize={poemFontSize}
                                setPoemFontSize={setPoemFontSize}
                                poemColor={poemColor}
                                setPoemColor={setPoemColor}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleApplySettings}
                                className="bg-purple-700 w-full text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Apply Settings
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}