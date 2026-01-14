# Swedish Road Sign Resources for Körkortsteori

## Official Resources

### Transportstyrelsen (Swedish Transport Agency)
The official government authority for Swedish traffic regulations and road signs.

**Website**: https://www.transportstyrelsen.se/
- Official resource for all Swedish traffic regulations
- Complete catalog of Swedish road signs
- Legal definitions and requirements
- Updated with current traffic law

**Road Signs Section**: https://www.transportstyrelsen.se/sv/vagtrafik/Vagmarken/
- Comprehensive listing of all official Swedish road signs
- High-quality images suitable for educational use
- Descriptions in Swedish
- Organized by category (warning, prohibition, mandatory, information)

## Road Sign Categories in Sweden

### 1. Varningsmärken (Warning Signs)
- **Shape**: Equilateral triangle
- **Colors**: Yellow background, black symbol, red border
- **Purpose**: Warn of hazards ahead
- **Examples**: Curves, animals, pedestrians, road work

### 2. Förbudsmärken (Prohibition Signs)
- **Shape**: Circle
- **Colors**: White or blue background, red border
- **Purpose**: Indicate prohibitions or restrictions
- **Examples**: Speed limits, no entry, no parking, no overtaking

### 3. Påbudsmärken (Mandatory Signs)
- **Shape**: Circle
- **Colors**: Blue background, white symbol
- **Purpose**: Indicate mandatory actions
- **Examples**: Turn direction, cycle path, pedestrian path

### 4. Upplysande märken (Information Signs)
- **Shape**: Rectangle or square
- **Colors**: Blue or green background, white text/symbols
- **Purpose**: Provide information about routes, services, and facilities
- **Examples**: Motorway signs, parking, services

## Image Database Recommendations

### For Question Generation with Images

**Option 1: Manual Download from Transportstyrelsen**
1. Visit the official website
2. Download individual sign images
3. Save to `public/assets/` with descriptive names
4. Format: `kork-sign-[category]-[name].png`
   - Example: `kork-sign-warning-elg.png` (elk warning)
   - Example: `kork-sign-forbud-stop.png` (stop sign)

**Option 2: Swedish Road Sign Dataset**
Look for open data initiatives or educational resources:
- **Trafikverket** (Swedish Transport Administration): May have educational materials
- **Körkortonline.se**: Educational driving theory websites (check licensing)
- **Wikipedia Commons**: Some Swedish road signs available under Creative Commons

## Implementation Strategy

### Phase 1: Text-Only Questions (Current)
- All questions describe signs with text
- Example: "En rund skylt med röd kant och vit botten som visar siffran 70"
- No dependency on external images
- **Status**: ✅ Complete (10 questions created)

### Phase 2: Add Images Later
When ready to add images:
1. Identify which questions would benefit most from images
2. Download or create sign images
3. Place in `public/assets/korkortsteori/`
4. Update YAML files to reference images
5. Test image loading and display

### Recommended Signs for Images

**High Priority** (most commonly tested):
1. **Stoppskylt** - Stop sign (octagon, red background, white text "STOPP")
2. **Väjningsplikt** - Give way (inverted triangle, red border)
3. **Huvudled** - Priority road (yellow diamond)
4. **Hastighetsbegränsningar** - Speed limit signs (various)
5. **Motorväg** - Motorway (blue, white car symbol)
6. **Farligt gods** - Dangerous goods prohibition

**Medium Priority**:
- Common warning signs (elk, pedestrians, curves)
- Parking signs
- One-way street signs
- Bicycle path signs

## Legal Considerations

### Public Domain / Fair Use
- Official Swedish road signs are standardized by law
- Educational use typically permitted
- Verify licensing before distribution
- Transportstyrelsen images may require attribution

### Attribution Template
```
Vägmärke från Transportstyrelsen (Swedish Transport Agency)
https://www.transportstyrelsen.se/
Används för utbildningsändamål
```

## Quality Guidelines for Images

When adding images to the question database:

1. **Resolution**: Minimum 200x200px, prefer 400x400px
2. **Format**: PNG with transparency preferred
3. **Clarity**: Signs should be clearly visible and recognizable
4. **Consistency**: All signs from same source/style
5. **File naming**: Descriptive and consistent
   - Format: `kork-sign-[type]-[description].png`
   - Example: `kork-sign-varning-barn.png`

## Question Generation with Images

When generating questions that reference images:

```yaml
- id: kork-sign-example
  type: multiple_choice
  tags:
  - Vägmärken
  - Förbud
  question: Vilken hastighet anger denna skylt?
  image: assets/korkortsteori/kork-sign-forbud-50.png
  options:
    - text: 50 km/h
      correct: true
      feedback: Korrekt! Skylten visar hastighetsbegränsning 50 km/h.
    # ... more options
  explanation: Denna runda skylt med röd kant anger hastighetsbegränsning...
```

## Automated Image Integration (Future Enhancement)

Potential automation ideas:
1. **Script to download official signs**: Automated scraper for Transportstyrelsen
2. **Image recognition**: Match question content to appropriate signs
3. **Batch processing**: Generate multiple questions per sign type
4. **Dynamic image selection**: Randomly select from sign variations

## Current Status

✅ **Completed**:
- Text-based questions created (10 questions)
- Documentation for future image integration
- Resource identification (Transportstyrelsen)

🔄 **Pending**:
- Image database creation
- Image integration in questions
- Automated image downloading (if permitted)

📋 **Nice to Have**:
- Interactive sign identification questions
- Sign combination scenarios
- Real photo scenarios with multiple signs
