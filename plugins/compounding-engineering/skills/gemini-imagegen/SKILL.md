---
name: gemini-imagegen
description: Generate and edit images using the Gemini API (Nano Banana). Use this skill when creating images from text prompts, editing existing images, applying style transfers, generating logos with text, creating stickers, product mockups, or any image generation/manipulation task. Supports text-to-image, image editing, multi-turn refinement, and composition from multiple reference images.
---

# Gemini Image Generation (Nano Banana)

Generate and edit images using Google's Gemini API. The environment variable `GEMINI_API_KEY` must be set.

## Available Models

| Model | Alias | Resolution | Best For |
|-------|-------|------------|----------|
| `gemini-2.5-flash-image` | Nano Banana | 1024px | Speed, high-volume tasks |
| `gemini-3-pro-image-preview` | Nano Banana Pro | Up to 4K | Professional assets, complex instructions, text rendering |

## Quick Start Scripts

### Text-to-Image
```bash
python scripts/generate_image.py "A cat wearing a wizard hat" output.png
```

### Edit Existing Image
```bash
python scripts/edit_image.py input.png "Add a rainbow in the background" output.png
```

### Multi-Turn Chat (Iterative Refinement)
```bash
python scripts/multi_turn_chat.py
```

## Core API Pattern

All image generation uses the `generateContent` endpoint with `responseModalities: ["TEXT", "IMAGE"]`:

```python
import os
import base64
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=["Your prompt here"],
)

for part in response.parts:
    if part.text:
        print(part.text)
    elif part.inline_data:
        image = part.as_image()
        image.save("output.png")
```

## Image Configuration Options

Control output with `image_config`:

```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[prompt],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="16:9",  # 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
            image_size="2K"       # 1K, 2K, 4K (Pro only for 4K)
        ),
    )
)
```

## Editing Images

Pass existing images with text prompts:

```python
from PIL import Image

img = Image.open("input.png")
response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=["Add a sunset to this scene", img],
)
```

## Multi-Turn Refinement

Use chat for iterative editing:

```python
from google.genai import types

chat = client.chats.create(
    model="gemini-2.5-flash-image",
    config=types.GenerateContentConfig(response_modalities=['TEXT', 'IMAGE'])
)

response = chat.send_message("Create a logo for 'Acme Corp'")
# Save first image...

response = chat.send_message("Make the text bolder and add a blue gradient")
# Save refined image...
```

## Prompting Best Practices

### Photorealistic Scenes
Include camera details: lens type, lighting, angle, mood.
> "A photorealistic close-up portrait, 85mm lens, soft golden hour light, shallow depth of field"

### Stylized Art
Specify style explicitly:
> "A kawaii-style sticker of a happy red panda, bold outlines, cel-shading, white background"

### Text in Images
Be explicit about font style and placement. Use `gemini-3-pro-image-preview` for best results:
> "Create a logo with text 'Daily Grind' in clean sans-serif, black and white, coffee bean motif"

### Product Mockups
Describe lighting setup and surface:
> "Studio-lit product photo on polished concrete, three-point softbox setup, 45-degree angle"

## Advanced Features (Pro Model Only)

### Google Search Grounding
Generate images based on real-time data:

```python
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=["Visualize today's weather in Tokyo as an infographic"],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        tools=[{"google_search": {}}]
    )
)
```

### Multiple Reference Images (Up to 14)
Combine elements from multiple sources:

```python
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[
        "Create a group photo of these people in an office",
        Image.open("person1.png"),
        Image.open("person2.png"),
        Image.open("person3.png"),
    ],
)
```

## REST API (curl)

```bash
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "A serene mountain landscape"}]}]
  }' | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' | base64 --decode > output.png
```

## Notes

- All generated images include SynthID watermarks
- Image-only mode (`responseModalities: ["IMAGE"]`) won't work with Google Search grounding
- For editing, describe changes conversationally—the model understands semantic masking
