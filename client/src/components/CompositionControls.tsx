import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface CompositionControlsProps {
  textSize: number;
  onTextSizeChange: (value: number) => void;
  colorIntensity: number;
  onColorIntensityChange: (value: number) => void;
  backgroundBlur: number;
  onBackgroundBlurChange: (value: number) => void;
}

export default function CompositionControls({
  textSize,
  onTextSizeChange,
  colorIntensity,
  onColorIntensityChange,
  backgroundBlur,
  onBackgroundBlurChange,
}: CompositionControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Text Size</Label>
        <Slider
          value={[textSize]}
          onValueChange={([value]) => onTextSizeChange(value)}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Color Intensity</Label>
        <Slider
          value={[colorIntensity]}
          onValueChange={([value]) => onColorIntensityChange(value)}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Background Blur</Label>
        <Slider
          value={[backgroundBlur]}
          onValueChange={([value]) => onBackgroundBlurChange(value)}
          min={0}
          max={20}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}