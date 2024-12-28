import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, Loader2, MoveIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CompositionControls from "./CompositionControls";
import { 
  TbBrandTwitter,
  TbBrandLinkedin,
  TbBrandFacebook,
  TbBrandInstagram,
  TbBrandWordpress
} from "react-icons/tb";

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

// Update SIZES constant with more platforms
const SIZES = [
  { 
    name: "Twitter", 
    width: 1200, 
    height: 675,
    icon: TbBrandTwitter,
    description: "Perfect for Twitter posts"
  },
  { 
    name: "LinkedIn", 
    width: 1200, 
    height: 627,
    icon: TbBrandLinkedin,
    description: "Optimized for LinkedIn feed"
  },
  { 
    name: "Facebook", 
    width: 1200, 
    height: 630,
    icon: TbBrandFacebook,
    description: "Ideal for Facebook sharing"
  },
  { 
    name: "Instagram", 
    width: 1080, 
    height: 1080,
    icon: TbBrandInstagram,
    description: "Square format for Instagram"
  },
  { 
    name: "WordPress", 
    width: 1200, 
    height: 628,
    icon: TbBrandWordpress,
    description: "Blog post featured image"
  },
];

// Grid configuration for text block positioning
const GRID = {
  rows: 3,
  cols: 3,
  snapThreshold: 0.05, // Distance to snap (5% of canvas size)
};

// Function to wrap text into multiple lines
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Add color analysis utilities
function getPixelData(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  let r = 0, g = 0, b = 0;

  // Calculate average RGB values
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixels = data.length / 4;
  return {
    r: Math.round(r / pixels),
    g: Math.round(g / pixels),
    b: Math.round(b / pixels)
  };
}

function calculateLuminance(r: number, g: number, b: number) {
  // Relative luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getContrastColor(backgroundColor: { r: number, g: number, b: number }) {
  const luminance = calculateLuminance(backgroundColor.r, backgroundColor.g, backgroundColor.b);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

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
  const [showMoveGuide, setShowMoveGuide] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Local composition states
  const [textSize, setTextSize] = useState(1);
  const [textPosition, setTextPosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [colorIntensity, setColorIntensity] = useState(1);
  const [backgroundBlur, setBackgroundBlur] = useState(0);

  // Store canvas dimensions for coordinate calculations
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Load font first
    const loadFont = async () => {
      try {
        console.log(`Loading font: ${font}`);
        await document.fonts.load(`bold 16px "${font}"`);
        console.log(`Font "${font}" loaded successfully`);
        setFontLoaded(true);
      } catch (error) {
        console.error(`Error loading font ${font}:`, error);
        setRenderError(`Failed to load font: ${font}`);
      }
    };

    loadFont();
  }, [font]);

  useEffect(() => {
    if (!canvasRef.current || !fontLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Failed to get canvas context");
      setRenderError("Failed to initialize canvas");
      return;
    }

    const renderPreview = () => {
      console.log("Starting canvas render with font:", font);

      if (!imageUrl) {
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

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Text configuration
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';

          // Calculate font size with adjustment
          const maxWidth = canvas.width * 0.4;
          let fontSize = Math.min(canvas.width * 0.06, canvas.height * 0.12) * textSize;

          // Set font with proper formatting and fallbacks
          const fontString = `bold ${fontSize}px "${font}", system-ui, sans-serif`;
          console.log("Applying font:", fontString);
          ctx.font = fontString;

          // Log font metrics for debugging
          const metrics = ctx.measureText('Test');
          console.log("Font metrics:", {
            actualFont: ctx.font,
            width: metrics.width,
            height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
          });

          // Split title into words and arrange them
          const lines = wrapText(ctx, title, maxWidth);
          console.log("Text wrapped into lines:", lines);

          // Calculate total height of text block
          const lineHeight = fontSize * 1.2;
          const totalHeight = lineHeight * lines.length;

          // Calculate starting position
          const xPos = canvas.width * textPosition.x;
          const yPos = canvas.height * textPosition.y - totalHeight / 2;

          // Add shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = fontSize * 0.15;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          // Analyze background color at text position
          const padding = fontSize * 0.5;
          const bgColor = getPixelData(
            ctx,
            Math.max(0, xPos - padding),
            Math.max(0, yPos - padding),
            Math.min(canvas.width - xPos + padding, maxWidth + padding * 2),
            Math.min(canvas.height - yPos + padding, totalHeight + padding * 2)
          );

          // Determine optimal text color
          const textColor = getContrastColor(bgColor);

          // Draw each line with dynamic color
          lines.forEach((line, index) => {
            const lineY = yPos + index * lineHeight;

            // Draw white outline
            ctx.strokeStyle = textColor === '#000000' ? 'white' : 'black';
            ctx.lineWidth = fontSize * 0.08;
            ctx.strokeText(line, xPos, lineY);

            // Draw text with color intensity
            ctx.fillStyle = textColor;
            if (colorIntensity !== 1) {
              ctx.globalAlpha = Math.max(0, Math.min(1, colorIntensity));
            }
            ctx.fillText(line, xPos, lineY);
          });

          // If dragging or hovering, show move guide
          if (showMoveGuide || isDragging) {
            // Draw a subtle indicator around the text block
            const padding = fontSize * 0.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(
              xPos - padding,
              yPos - padding,
              maxWidth + padding * 2,
              totalHeight + padding * 2
            );
            ctx.setLineDash([]);
          }

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
  }, [imageUrl, title, font, fontLoaded, primaryColor, textSize, textPosition, colorIntensity, backgroundBlur, showMoveGuide, isDragging, toast]);

  // Handle mouse events for drag and drop
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Calculate text bounds
    const ctx = canvas.getContext('2d')!;
    const fontSize = Math.min(canvas.width * 0.06, canvas.height * 0.12) * textSize;
    ctx.font = `bold ${fontSize}px ${font}, sans-serif`;
    const maxWidth = canvas.width * 0.4;
    const lines = wrapText(ctx, title, maxWidth);
    const lineHeight = fontSize * 1.2;
    const totalHeight = lineHeight * lines.length;

    const textX = canvas.width * textPosition.x;
    const textY = canvas.height * textPosition.y - totalHeight / 2;

    // Check if click is within text bounds (with some padding)
    const padding = fontSize * 0.5;
    if (
      mouseX >= textX - padding &&
      mouseX <= textX + maxWidth + padding &&
      mouseY >= textY - padding &&
      mouseY <= textY + totalHeight + padding
    ) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isDragging) {
      const newX = x / canvas.width;
      const newY = y / canvas.height;

      const nearestPoint = findNearestGridPoint(newX, newY);
      if (nearestPoint) {
        setTextPosition(nearestPoint);
      } else {
        const clampedX = Math.max(0.1, Math.min(0.9, newX));
        const clampedY = Math.max(0.1, Math.min(0.9, newY));
        setTextPosition({ x: clampedX, y: clampedY });
      }
    } else {
      // Update hover state for text block
      const ctx = canvas.getContext('2d')!;
      const fontSize = Math.min(canvas.width * 0.06, canvas.height * 0.12) * textSize;
      ctx.font = `bold ${fontSize}px ${font}, sans-serif`;
      const maxWidth = canvas.width * 0.4;
      const lines = wrapText(ctx, title, maxWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = lineHeight * lines.length;

      const textX = canvas.width * textPosition.x;
      const textY = canvas.height * textPosition.y - totalHeight / 2;

      const padding = fontSize * 0.5;
      setShowMoveGuide(
        x >= textX - padding &&
        x <= textX + maxWidth + padding &&
        y >= textY - padding &&
        y <= textY + totalHeight + padding
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setShowMoveGuide(false);
  };

  // Function to find nearest grid point
  const findNearestGridPoint = (x: number, y: number): Position | null => {
    const gridPoints: Position[] = [];

    // Generate grid points
    for (let row = 0; row <= GRID.rows; row++) {
      for (let col = 0; col <= GRID.cols; col++) {
        gridPoints.push({
          x: col / GRID.cols,
          y: row / GRID.rows,
        });
      }
    }

    // Find nearest point within threshold
    let nearest: Position | null = null;
    let minDistance = Infinity;

    gridPoints.forEach(point => {
      const dx = point.x - x;
      const dy = point.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < GRID.snapThreshold && distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    return nearest;
  };

  const handleDownload = async (width: number, height: number, name: string) => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;

      // Create a temporary canvas for the resized image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        throw new Error("Failed to get temporary canvas context");
      }

      // Draw the original canvas content onto the temporary canvas with proper scaling
      tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);

      const dataUrl = tempCanvas.toDataURL('image/png');
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `cover-${name.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `Image downloaded for ${name}`,
      });
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
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`w-full h-full object-cover ${isDragging ? 'cursor-grabbing' : (showMoveGuide ? 'cursor-grab' : 'cursor-default')}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
            {imageUrl && (
              <div className="absolute bottom-4 left-4 p-2 bg-black/50 text-white rounded text-sm">
                <MoveIcon className="inline-block w-4 h-4 mr-2" />
                Drag text to reposition
              </div>
            )}
          </div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SIZES.map((size) => {
              const Icon = size.icon;
              return (
                <Button
                  key={size.name}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 py-4"
                  onClick={() => handleDownload(size.width, size.height, size.name)}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{size.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {size.width}x{size.height}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}