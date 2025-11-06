import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import type { Product } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

interface ProductGeneratorProps {
  onAddCustomProductToCart: (product: Product) => void;
}

const ProductGenerator: React.FC<ProductGeneratorProps> = ({ onAddCustomProductToCart }) => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A synthwave style notebook cover design of: ${prompt}` }] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          setGeneratedImage(imageUrl);
          return;
        }
      }
      throw new Error("No image data found in response.");
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!generatedImage) return;

    const customProduct: Product = {
      id: Date.now(), // Temporary ID for client-side
      name: t('customProduct'),
      price: 899, // Custom product price
      imageUrl: generatedImage,
      rating: 5.0, // Let's be optimistic
      brand: 'Nexora Custom',
      color: 'Custom',
    };
    onAddCustomProductToCart(customProduct);
    setGeneratedImage(null);
    setPrompt('');
  };

  return (
    <div className="bg-surface/50 p-6 rounded-lg shadow-lg border border-primary/30 mb-8">
      <h2 className="text-3xl font-bold text-text-light font-orbitron mb-4 text-center text-glow">{t('generateYourOwn')}</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('generatorPromptPlaceholder')}
          className="flex-grow w-full md:w-auto pl-4 pr-4 py-2 bg-background/50 border border-primary/40 rounded-full text-text-light placeholder-text-medium/70 focus:outline-none focus:ring-2 focus:ring-secondary/80 transition-all"
          aria-label={t('generatorPromptPlaceholder')}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full md:w-auto px-6 py-2 text-base font-semibold text-background bg-secondary rounded-full hover:bg-cyan-300 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-all"
        >
          {isLoading ? t('generating') : t('generateButton')}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      
      <div className="mt-6 flex flex-col items-center">
        {isLoading && <div className="animate-pulse text-text-medium">{t('generating')}</div>}
        {generatedImage && (
          <div className="animate-fade-in-up text-center">
            <h3 className="text-xl font-semibold text-text-light font-orbitron mb-4">{t('yourCreation')}</h3>
            <img src={generatedImage} alt="Generated notebook cover" className="inline-block w-64 h-64 object-cover rounded-lg border-2 border-secondary mb-4 shadow-lg shadow-secondary/30" />
            <button
              onClick={handleAddToCart}
              className="w-full max-w-xs bg-primary text-background font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
            >
              {t('addToCartGenerated')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGenerator;