interface TextComposition {
  size: number;
  verticalPosition: number;
  colorIntensity: number;
  backgroundBlur: number;
}

interface GenerateImageParams {
  title: string;
  description: string;
  style: string;
  logo: File | null;
  font: string;
  primaryColor: string;
  textComposition: TextComposition;
}

export async function generateImage(params: GenerateImageParams): Promise<string> {
  const formData = new FormData();
  formData.append("title", params.title);
  formData.append("description", params.description);
  formData.append("style", params.style);
  formData.append("font", params.font);
  formData.append("primaryColor", params.primaryColor);
  formData.append("textComposition", JSON.stringify(params.textComposition));
  if (params.logo) {
    formData.append("logo", params.logo);
  }

  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to generate image");
  }

  const data = await response.json();
  return data.imageUrl;
}