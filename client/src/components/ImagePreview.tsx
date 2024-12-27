import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CompositionControls from "./CompositionControls";

interface ImagePreviewProps {
  imageUrl: string | null;
  loading: boolean;
  title: string;
  font: string;
  primaryColor: string;
}

interface Position {
  x: number;
  y: number;
}

const SIZES = [
  { name: "Twitter", width: 1200, height: 675 },
  { name: "Medium", width: 1400, height: 787 },
  { name: "WordPress", width: 1200, height: 628 },
];

export default function ImagePreview({
  imageUrl,
  loading,
  title,
  font,
  primaryColor,
}: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Local composition states
  const [textSize, setTextSize] = useState(1);
  const [textPosition, setTextPosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [colorIntensity, setColorIntensity] = useState(1);
  const [backgroundBlur, setBackgroundBlur] = useState(0);

  // Store canvas dimensions for coordinate calculations
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Failed to get canvas context");
      setRenderError("Failed to initialize canvas");
      return;
    }

    const renderPreview = () => {
      if (!imageUrl) {
        // Set default canvas size and clear
        canvas.width = 1200;
        canvas.height = 675;
        setCanvasDimensions({ width: 1200, height: 675 });
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          setCanvasDimensions({ width: img.width, height: img.height });
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Apply background blur if needed
          if (backgroundBlur > 0) {
            ctx.filter = `blur(${backgroundBlur}px)`;
          }

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Reset filter for text
          ctx.filter = 'none';

          // Text configuration
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Calculate font size with adjustment
          const maxWidth = canvas.width * 0.8;
          let fontSize = Math.min(canvas.width * 0.08, canvas.height * 0.15) * textSize;
          ctx.font = `bold ${fontSize}px ${font}, sans-serif`;

          // Adjust text size if needed
          let textWidth = ctx.measureText(title).width;
          if (textWidth > maxWidth) {
            fontSize *= maxWidth / textWidth;
            ctx.font = `bold ${fontSize}px ${font}, sans-serif`;
          }

          // Calculate position based on relative coordinates
          const xPos = canvas.width * textPosition.x;
          const yPos = canvas.height * textPosition.y;

          // Add shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = fontSize * 0.15;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          // Draw white outline
          ctx.strokeStyle = 'white';
          ctx.lineWidth = fontSize * 0.08;
          ctx.strokeText(title, xPos, yPos);

          // Draw text with color intensity
          ctx.fillStyle = primaryColor;
          if (colorIntensity !== 1) {
            ctx.globalAlpha = Math.max(0, Math.min(1, colorIntensity));
          }
          ctx.fillText(title, xPos, yPos);

          // Reset
          ctx.globalAlpha = 1;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          setRenderError(null);
        } catch (error) {
          console.error("Error rendering canvas:", error);
          setRenderError("Failed to render image");
          toast({
            title: "Error",
            description: "Failed to render image with text overlay",
            variant: "destructive",
          });
        }
      };

      img.onerror = () => {
        console.error("Failed to load image");
        setRenderError("Failed to load image");
        toast({
          title: "Error",
          description: "Failed to load the generated image",
          variant: "destructive",
        });
      };

      img.src = imageUrl;
    };

    renderPreview();
  }, [imageUrl, title, font, primaryColor, textSize, textPosition, colorIntensity, backgroundBlur, toast]);

  // Handle mouse events for drag and drop
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageUrl) return;
    setIsDragging(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    setTextPosition({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    setTextPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

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
      toast({
        title: "Error",
        description: "Failed to download the image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : renderError ? (
          <div className="absolute inset-0 flex items-center justify-center text-destructive">
            {renderError}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </div>

      {imageUrl && !renderError && (
        <>
          <Card className="p-4">
            <CompositionControls
              textSize={textSize}
              onTextSizeChange={setTextSize}
              colorIntensity={colorIntensity}
              onColorIntensityChange={setColorIntensity}
              backgroundBlur={backgroundBlur}
              onBackgroundBlurChange={setBackgroundBlur}
            />
          </Card>

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
        </>
      )}
    </div>
  );
}