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
            className={`flex items-start space-x-3 p-3 cursor-pointer rounded-lg border ${
              selected === template.name
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value={template.name} id={template.name} />
            <div className="space-y-1">
              <span className="font-medium">{template.label}</span>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
