# Multi-Subject Support Implementation

This document describes the multi-subject functionality added to Iller5.

## Overview

Iller5 now supports multiple study subjects with a subject selection interface. Users can choose between different subjects (e.g., Läkarexamen, Körkortsteori) and switch between them while maintaining separate progress tracking.

## Architecture Changes

### 1. Subject Picker Component (`src/components/SubjectPicker.vue`)

A new landing page component that displays available subjects:
- Shows all subjects from the `data/` directory
- Displays question counts for each subject
- Provides a clean, accessible interface for subject selection
- Automatically shown when multiple subjects are available

### 2. Store Updates (`src/stores/study.js`)

**New State:**
- `selectedSubject`: Persisted in localStorage to remember user's choice
- `view`: Extended to include 'subjectPicker' state

**New Getters:**
- `filteredQuestions`: Filters questions by selected subject

**New Actions:**
- `selectSubject(subjectKey)`: Sets the selected subject and navigates to dashboard

**Modified Behavior:**
- `loadContent()`: Now determines initial view based on subject count
  - Single subject: Auto-selects and goes to dashboard
  - Multiple subjects: Shows subject picker if no selection exists
- `startSession()`: Uses filtered questions based on selected subject

### 3. Dashboard Updates (`src/components/Dashboard.vue`)

**Changes:**
- All statistics now based on `filteredQuestions` instead of all questions
- `subjectsList` computed to only show selected subject's topics
- New "Byt ämne" (Switch subject) button (only visible when multiple subjects exist)
- Subject header showing current subject name and question count

### 4. App Component (`src/App.vue`)

**Changes:**
- Imports `SubjectPicker` component
- Transition now includes subject picker view
- Maintains smooth transitions between all views

## Content Structure

### Directory Layout
```
data/
├── medical_exam/
│   ├── kardiologi.yaml
│   ├── neurologi.yaml
│   └── ...
└── korkortsteori/
    ├── trafikregler.yaml
    ├── vagmarken.yaml
    └── README.md
```

### Bundle Output (`public/content.json`)
```json
{
  "subjects": {
    "medical_exam": ["kardiologi", "neurologi", ...],
    "korkortsteori": ["trafikregler", "vagmarken"]
  },
  "questions": [
    {
      "id": "...",
      "source": "medical_exam/kardiologi",
      ...
    },
    {
      "id": "...",
      "source": "korkortsteori/trafikregler",
      ...
    }
  ]
}
```

## Question Generation

### System Prompts (`scripts/generate.py`)

Two specialized system prompts:
1. **SYSTEM_PROMPT_MEDICAL**: For medical exam questions (advanced, specialist-level)
2. **SYSTEM_PROMPT_KORKORTSTEORI**: For Swedish driving theory (exam-level, pedagogical)

The `get_system_prompt(subject)` function selects the appropriate prompt based on the subject.

### ID Prefixes

- Medical exam: `med-{topic}-{uuid}`
- Körkortsteori: `kork-{topic}-{uuid}`

## Backwards Compatibility

### Single Subject Mode
When only one subject exists in `data/`:
- Subject picker is skipped
- User goes directly to dashboard
- Behavior identical to pre-multi-subject version
- No "Byt ämne" button shown

### Progress Tracking
- Progress is stored globally by question ID
- Works across all subjects
- Switching subjects maintains progress for each subject independently

## User Flow

### Multi-Subject Flow
1. App loads → Shows subject picker
2. User selects subject → Dashboard with filtered questions
3. User studies → Progress tracked for that subject
4. User clicks "Byt ämne" → Returns to subject picker
5. User selects different subject → Dashboard with different filtered questions

### Single-Subject Flow (Legacy)
1. App loads → Dashboard (subject auto-selected)
2. User studies → Normal flow
3. No subject picker or switch button visible

## Localization

### Subject Display Names
Defined in `SubjectPicker.vue` and `Dashboard.vue`:
```javascript
const subjectDisplayOverrides = {
  medical_exam: 'Läkarexamen',
  korkortsteori: 'Körkortsteori',
};
```

### Topic Display Names
Defined in `Dashboard.vue`:
```javascript
const topicDisplayOverrides = {
  allmanmedicin: 'Allmänmedicin',
  oron_nasa_hals: 'Öron-näsa-hals',
};
```

## Testing Checklist

- [x] Subject picker displays all subjects with correct counts
- [x] Selecting a subject navigates to dashboard
- [x] Dashboard shows only selected subject's questions
- [x] Quiz uses only filtered questions
- [x] "Byt ämne" button navigates back to picker
- [x] Progress tracking works for each subject independently
- [x] Single-subject mode auto-selects and hides picker
- [x] Selected subject persists in localStorage
- [x] All medical exam functionality remains intact

## Future Enhancements

Potential improvements:
1. **Subject-specific themes**: Different color schemes per subject
2. **Cross-subject statistics**: Overall progress dashboard
3. **Subject icons**: Visual indicators for each subject
4. **Subject categories**: Organize subjects into groups
5. **Import/Export**: Subject-specific progress backup
6. **Image support**: Enhanced handling for subjects with many images (like road signs)
