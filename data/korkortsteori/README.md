# Körkortsteori - Swedish Driving Theory

This directory contains Swedish driving theory questions for the B-körkort (car driving license) test.

## Topics

- **trafikregler.yaml** - Traffic rules and regulations
- **vagmarken.yaml** - Road signs and traffic signals

## Swedish Road Sign Resources

When creating questions with images, you can use these official Swedish resources:

### Transportstyrelsen (Swedish Transport Agency)
- Official website: https://www.transportstyrelsen.se/
- Road signs overview: https://www.transportstyrelsen.se/sv/vagtrafik/Vagmarken/
- Complete road sign catalog with descriptions

### Road Sign Database
For generating questions with road sign images:
1. Download official road sign images from Transportstyrelsen
2. Save them in `/public/assets/` with descriptive names (e.g., `kork-sign-stoppskylt.png`)
3. Reference them in the YAML `image` field

### Common Road Sign Categories
- **Varningsmärken (Warning signs)**: Yellow triangles with black symbols
- **Förbudsmärken (Prohibition signs)**: Round with red border
- **Påbudsmärken (Mandatory signs)**: Round with blue background
- **Upplysande märken (Information signs)**: Blue or green rectangular signs

## Question Generation

Use the generate.py script with the Swedish system prompt:

```bash
python scripts/generate.py
# Select: korkortsteori
# Select topic or create new
```

The script will automatically use the Swedish körkortsteori prompt which focuses on:
- Swedish traffic regulations
- Realistic exam scenarios
- Clear explanations suitable for learners
- Proper Swedish terminology

## Image Guidelines

When using images for road signs:
1. Describe the sign clearly in the question if no image is available
2. Use the format: "En rund skylt med röd kant och vit botten som visar..." (A round sign with red border and white background showing...)
3. Always provide `image: null` initially, then add images later
4. Name images descriptively: `kork-sign-[type]-[description].png`

## Content Quality

Questions should:
- Be based on official Swedish traffic regulations (Trafikförordningen)
- Use realistic scenarios from Swedish roads
- Include proper Swedish terminology
- Be appropriate for B-körkort (standard car license) level
- Have clear, pedagogical explanations
