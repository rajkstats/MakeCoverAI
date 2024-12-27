import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ImagePreviewProps {
  imageUrl: string | null;
  loading: boolean;
  title: string;
  font: string;
  primaryColor: string;
}

const SIZES = [
  { name: "Twitter", width: 1200, height: 675 },
  { name: "Medium", width: 1400, height: 787 },
  { name: "WordPress", width: 1200, height: 628 },
];

export default function ImagePreview({ imageUrl, loading, title, font, primaryColor }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Add text overlay
        ctx.fillStyle = primaryColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate font size based on canvas width
        const fontSize = canvas.width * 0.08;
        ctx.font = `bold ${fontSize}px ${font}, sans-serif`;

        // Add text shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = fontSize * 0.1;
        ctx.shadowOffsetX = fontSize * 0.02;
        ctx.shadowOffsetY = fontSize * 0.02;

        // Draw text
        ctx.fillText(title, canvas.width / 2, canvas.height / 2);
      };
      img.src = imageUrl;
    }
  }, [imageUrl, title, font, primaryColor]);

  const handleDownload = async (width: number, height: number, name: string) => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `cover-${name.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : imageUrl ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Preview will appear here
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => (
            <Button
              key={size.name}
              variant="outline"
              className="w-full"
              onClick={() => handleDownload(size.width, size.height, size.name)}
            >
              <Download className="mr-2 h-4 w-4" />
              {size.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}