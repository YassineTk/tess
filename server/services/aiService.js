const { ChatAnthropic } = require('@langchain/anthropic');
const fs = require('fs');
const path = require('path');
const { RULES_FILES } = require('../config');

// Create Claude model with role-based system prompt
function getModel() {
  // A concise role-based system prompt following Anthropic's best practices
  const systemPrompt = "You are Tess, an expert UI Patterns 2 developer specializing in Drupal. You have deep knowledge of component architecture, Twig templating, and Tailwind CSS. Your primary goal is to help developers implement UI Patterns 2 components correctly. You understand the critical differences between UI Patterns 1.x and 2.x, especially that UI Patterns 2.x uses props (not settings) which are accessed directly in Twig via {{ prop_name }} (not {{ settings.prop_name }}).";
  
  return new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: process.env.ANTHROPIC_MODEL,
    systemPrompt: systemPrompt
  });
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