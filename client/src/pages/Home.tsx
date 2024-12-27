import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import StyleSelector from "@/components/StyleSelector";
import CustomizePanel from "@/components/CustomizePanel";
import ImagePreview from "@/components/ImagePreview";
import { useMutation } from "@tanstack/react-query";
import { generateImage } from "@/lib/api";
import type { StyleTemplate } from "@/lib/templates";

export default function Home() {
  const [title, setTitle] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<StyleTemplate>("modern");
  const [logo, setLogo] = useState<File | null>(null);
  const [font, setFont] = useState("inter");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

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

    generateMutation.mutate({
      title,
      style: selectedStyle,
      logo,
      font,
      primaryColor,
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

              <StyleSelector
                selected={selectedStyle}
                onSelect={setSelectedStyle}
              />

              <CustomizePanel
                logo={logo}
                onLogoChange={setLogo}
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
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
