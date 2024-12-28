import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { templates, type StyleTemplate } from "@/lib/templates";

interface StyleSelectorProps {
  selected: StyleTemplate;
  onSelect: (style: StyleTemplate) => void;
}

export default function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Style Template</Label>
      <RadioGroup
        value={selected}
        onValueChange={(value) => onSelect(value as StyleTemplate)}
        className="grid grid-cols-1 md:grid-cols-2 gap-2"
      >
        {templates.map((template) => (
          <Label
            key={template.name}
            className={`flex items-start space-x-3 p-3 cursor-pointer rounded-lg border transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-lg ${
              selected === template.name
                ? "border-primary bg-primary/5 shadow-md"
                : "border-muted hover:border-primary/50 hover:bg-accent/5"
            }`}
          >
            <RadioGroupItem 
              value={template.name} 
              id={template.name} 
              className="transition-transform duration-200 data-[state=checked]:scale-110"
            />
            <div className="space-y-1 transition-colors duration-200">
              <span className={`font-medium transition-colors duration-200 ${
                selected === template.name ? "text-primary" : ""
              }`}>
                {template.label}
              </span>
              <p className={`text-sm transition-colors duration-200 ${
                selected === template.name ? "text-primary/80" : "text-muted-foreground"
              }`}>
                {template.description}
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}