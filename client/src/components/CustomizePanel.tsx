import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomizePanelProps {
  font: string;
  onFontChange: (font: string) => void;
  primaryColor: string;
  onColorChange: (color: string) => void;
}

const FONTS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "montserrat", label: "Montserrat" },
  { value: "playfair", label: "Playfair Display" },
];

export default function CustomizePanel({
  font,
  onFontChange,
  primaryColor,
  onColorChange,
}: CustomizePanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="font">Font</Label>
        <Select value={font} onValueChange={onFontChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Primary Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            id="color"
            value={primaryColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-12 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={primaryColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}