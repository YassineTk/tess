const { ChatAnthropic } = require('@langchain/anthropic');
const fs = require('fs');
const path = require('path');
const { RULES_FILES } = require('../config');
const { ChatOllama } = require('@langchain/ollama');

// Create Claude model with role-based system prompt
function getModel() {
  const useLocalModel = process.env.USE_LOCAL_MODEL === 'true';
  console.log('useLocalModel', useLocalModel);
  
  if (useLocalModel) {
    // Use local Gemma 3 model
    return new ChatOllama({
      model: process.env.OLLAMA_MODEL,
    });
  } else {
    // Existing Claude implementation    
    return new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: process.env.ANTHROPIC_MODEL,
    });
  }
}

// Load rules content from file
function loadRulesContent(mode) {
  const rulesFile = RULES_FILES[mode] || RULES_FILES.basic;
  
  try {
    return fs.readFileSync(path.join(process.cwd(), rulesFile), 'utf8');
  } catch (error) {
    console.error(`Error reading ${rulesFile}:`, error);
    // Fallback to basic rules if the specific file doesn't exist
    return fs.readFileSync(path.join(process.cwd(), RULES_FILES.basic), 'utf8');
  }
}

// Get the critical reminder text that's added to every message
function getCriticalReminder() {
  return `
CRITICAL REMINDER FOR UI PATTERNS 2:
1. Use .component.yml files (not .ui_patterns.yml)
2. Access props directly: {{ prop_name }} (NEVER {{ settings.prop_name }})
3. Story files should follow the pattern: component_name.variant_name.story.yml
   - Default story should be: component_name.default.story.yml
   - Additional variants: component_name.variant_name.story.yml
4. Don't use a "variants" property - instead use props with enum values
   - Example: 
     alignment:
       title: "Alignment"
       $ref: "ui-patterns://enum"
       enum:
         - default
         - vertical
       "meta:enum":
         default: "Default"
         vertical: "Vertical"
5. Slots NEVER have type definitions, only props do
   - CORRECT slots example:
     slots:
       image:
         title: Image
         description: "Card image."
   - Only props should have types (integer, string, enum, etc.)
6. In story files, image slots should be formatted like this:
   image:
     theme: image
     uri: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
     alt: Shoes
7. NEVER use static heading tags (h1, h2, etc.) in Twig templates
   - Instead, use a heading_level prop with h2 as default
   - Example in props:
     heading_level:
       title: "Heading Level"
       type: string
       default: "h2"
   - Example in Twig: <h{{ heading_level }}>{{ heading }}</h{{ heading_level }}>
8. Follow the example components exactly`;
}

module.exports = {
  getModel,
  loadRulesContent,
  getCriticalReminder
};