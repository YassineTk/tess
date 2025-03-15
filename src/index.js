import { ChatAnthropic } from '@langchain/anthropic';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('Loading rules...');
  
  // Read rules file directly
  const rulesContent = fs.readFileSync('./rules.md', 'utf8');
  
  // Documentation URLs
  const docsUrls = [
    'https://project.pages.drupalcode.org/ui_patterns/',
    'https://project.pages.drupalcode.org/ui_patterns/1-users/0-component-form/',
    'https://project.pages.drupalcode.org/ui_patterns/1-users/1-as-block/',
    'https://project.pages.drupalcode.org/ui_patterns/1-users/2-as-layout/',
    'https://project.pages.drupalcode.org/ui_patterns/1-users/3-in-field-formatter/',
    'https://project.pages.drupalcode.org/ui_patterns/1-users/4-with-views/',
    'https://project.pages.drupalcode.org/ui_patterns/1-users/5-presenter-templates/',
    'https://project.pages.drupalcode.org/ui_patterns/2-authors/0-authoring-a-component/',
    'https://project.pages.drupalcode.org/ui_patterns/2-authors/1-stories-and-library/',
    'https://project.pages.drupalcode.org/ui_patterns/2-authors/2-best-practices/',
    'https://project.pages.drupalcode.org/ui_patterns/2-authors/3-migration-from-UIP1/',
    'https://project.pages.drupalcode.org/ui_patterns/3-devs/1-source-plugins/',
    'https://project.pages.drupalcode.org/ui_patterns/3-devs/2-prop-type-plugins/',
    'https://project.pages.drupalcode.org/ui_patterns/3-devs/3-internals/',
    'https://project.pages.drupalcode.org/ui_patterns/faq/'
  ];
  
  // Create Claude model
  const model = new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: 'claude-3-7-sonnet-20250219',
    systemPrompt: rulesContent
  });
  
  // Start conversation
  console.log('\n=== Tess UI Patterns Assistant ===');
  console.log('Type your questions about UI Patterns components. Type "exit" to quit.\n');
  
  // Initialize conversation with documentation links
  let messages = [
    {
      role: 'user',
      content: `I'll be asking you questions about UI Patterns in Drupal. Please refer to these documentation sources for accurate information:
${docsUrls.join('\n')}

Please confirm you have these documentation references.`
    }
  ];
  
  // Get initial response
  try {
    const initialResponse = await model.invoke(messages);
    console.log('\nTess:', initialResponse.content);
    
    // Add assistant response to history
    messages.push({
      role: 'assistant',
      content: initialResponse.content
    });
    
    // Interactive loop
    const askQuestion = () => {
      rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          rl.close();
          return;
        }
        
        try {
          // Add user message to history
          messages.push({
            role: 'user',
            content: input
          });
          
          // Get response using messages array
          const response = await model.invoke(messages);
          console.log('\nTess:', response.content);
          
          // Add assistant response to history
          messages.push({
            role: 'assistant',
            content: response.content
          });
          
          // Continue conversation
          askQuestion();
        } catch (error) {
          console.error('Error:', error);
          askQuestion();
        }
      });
    };
    
    askQuestion();
  } catch (error) {
    console.error('Error starting conversation:', error);
  }
}

main();