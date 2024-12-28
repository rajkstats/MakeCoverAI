import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import StyleSelector from "@/components/StyleSelector";
import CustomizePanel from "@/components/CustomizePanel";
import ImagePreview from "@/components/ImagePreview";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateImage } from "@/lib/api";
import type { StyleTemplate } from "@/lib/templates";
import { queryClient } from "@/lib/queryClient";

// Preset configurations for each style
const stylePresets: Record<StyleTemplate, {
  font: string;
  primaryColor: string;
  textSize: number;
  textPosition: { x: number; y: number };
}> = {
  modern: {
    font: "inter",
    primaryColor: "#000000",
    textSize: 1,
    textPosition: { x: 0.5, y: 0.5 },
  },
  minimal: {
    font: "helvetica",
    primaryColor: "#333333",
    textSize: 0.8,
    textPosition: { x: 0.5, y: 0.33 },
  },
  bold: {
    font: "helvetica",
    primaryColor: "#111111",
    textSize: 1.5,
    textPosition: { x: 0.5, y: 0.5 },
  },
  tech: {
    font: "roboto",
    primaryColor: "#0066cc",
    textSize: 1.2,
    textPosition: { x: 0.5, y: 0.5 },
  },
  creative: {
    font: "georgia",
    primaryColor: "#cc3366",
    textSize: 1.3,
    textPosition: { x: 0.33, y: 0.67 },
  },
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<StyleTemplate>("modern");
  const [font, setFont] = useState(stylePresets.modern.font);
  const [primaryColor, setPrimaryColor] = useState(stylePresets.modern.primaryColor);
  const [textSize, setTextSize] = useState(stylePresets.modern.textSize);
  const [textPosition, setTextPosition] = useState(stylePresets.modern.textPosition);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { toast } = useToast();

  // Fetch style recommendations when title and description are available
  const { data: recommendations, isLoading: isRecommending } = useQuery({
    queryKey: ['/api/recommend-style', title, description],
    queryFn: async () => {
      if (!title.trim() || !description.trim()) return null;

      const response = await fetch('/api/recommend-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) throw new Error('Failed to get recommendations');
      return response.json();
    },
    enabled: !!(title.trim() && description.trim()),
    staleTime: 30000 // Cache for 30 seconds
  });

  // Apply recommendations when available
  useEffect(() => {
    if (recommendations && showRecommendations) {
      const { style, font: recommendedFont, primaryColor: recommendedColor } = recommendations;
      setSelectedStyle(style as StyleTemplate);
      setFont(recommendedFont);
      setPrimaryColor(recommendedColor);

      const preset = stylePresets[style as StyleTemplate];
      setTextSize(preset.textSize);
      setTextPosition(preset.textPosition);

      toast({
        title: "AI Style Recommendations Applied",
        description: recommendations.rationale,
      });
    }
  }, [recommendations, showRecommendations, toast]);

  // Handle style template change
  const handleStyleChange = (style: StyleTemplate) => {
    setSelectedStyle(style);
    const preset = stylePresets[style];
    setFont(preset.font);
    setPrimaryColor(preset.primaryColor);
    setTextSize(preset.textSize);
    setTextPosition(preset.textPosition);
    setShowRecommendations(false);

    toast({
      title: "Style Applied",
      description: `Applied ${style} style template`,
    });
  };

  const generateMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: (imageUrl) => {
      setGeneratedImage(imageUrl);
      toast({
        title: "Success!",
        description: "Your cover image has been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a blog title",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for the image",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      title,
      description,
      style: selectedStyle,
      font,
      primaryColor,
      textComposition: {
        size: textSize,
        verticalPosition: textPosition.y,
        colorIntensity: 1,
        backgroundBlur: 0,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            MakeCover
          </h1>
          <p className="text-muted-foreground mt-2">
            Create beautiful AI-powered cover images for your blog
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:order-1">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Blog Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Image Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the image you want to generate..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {recommendations && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRecommendations(true)}
                  disabled={isRecommending}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isRecommending ? "Getting AI Recommendations..." : "Use AI Recommendations"}
                </Button>
              )}

              <StyleSelector
                selected={selectedStyle}
                onSelect={handleStyleChange}
              />

              <CustomizePanel
                font={font}
                onFontChange={setFont}
                primaryColor={primaryColor}
                onColorChange={setPrimaryColor}
              />

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:order-2">
            <CardContent className="pt-6">
              <ImagePreview
                imageUrl={generatedImage}
                loading={generateMutation.isPending}
                title={title}
                font={font}
                primaryColor={primaryColor}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}