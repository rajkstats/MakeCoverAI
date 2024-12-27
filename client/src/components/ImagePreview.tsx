import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ImagePreviewProps {
  imageUrl: string | null;
  loading: boolean;
}

const SIZES = [
  { name: "Twitter", width: 1200, height: 675 },
  { name: "Medium", width: 1400, height: 787 },
  { name: "WordPress", width: 1200, height: 628 },
];

export default function ImagePreview({ imageUrl, loading }: ImagePreviewProps) {
  const handleDownload = async (width: number, height: number, name: string) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-${name.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
          <img
            src={imageUrl}
            alt="Generated cover"
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