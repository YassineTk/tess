# Tess - UI Patterns 2 Assistant

An AI assistant specialized in Drupal UI Patterns 2, helping developers understand and generate UI Pattern components.

## Setup

### Prerequisites
- Node.js (v18+)
- npm (v6+)
- Gemma 3 local model or Anthropic API key

## Using Local Models (Alternative to Claude)
⚠️**Please not that the docs integration for this part is still in progress**⚠️

You can use Tess with free local models instead of Claude:

1. **Download Ollama**
   - Visit [https://ollama.com/](https://ollama.com/) and install

2. **Install Gemma 3 Model**
   ```bash
   ollama pull gemma3:4b
   ```

⚠️ **System Resource Warning**
- Expect significant CPU/GPU usage during text generation
- Check RAM usage per model via https://ollama.com/library/gemma3

### Installation

1. **Clone the repository**
2. **Install dependencies**
```bash
npm install
```
3. **Create environment file**
Create a `.env` file in the root directory with the following variables:

```bash
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=your_anthropic_api_key_here or OLLAMA_MODEL=gemma3:4b
PORT=3000
```

4. **Start the server**
```bash
npm start
```


## Conversation Storage

Tess uses a file-based storage system to maintain conversations:

- All conversations are stored as JSON files in the `sessions` directory
- Each conversation is saved in its own file named with the session ID
- Conversations persist between server restarts
- Old conversations (older than 30 days) are automatically cleaned up

## Utility Commands

Clear all saved conversations:
```
npm run clear-sessions
```

## Future Improvements

### Immediate Concerns

- **Token Optimization**: Currently, each API request sends the entire conversation history to the AI model, which is inefficient and costly.

- **Frontend Refactoring**: The script.js file needs to be refactored into a more modular structure to improve maintainability. This work is planned but not yet implemented.

### Documentation Challenges

- **Documentation Loading**: The current approach loads documentation from static files. As our documentation grows, we'll need a more scalable solution.

- **Context Management**: Larger documentation will exceed token limits. We need to implement strategies like:
  - Selective loading of relevant documentation sections
  - Summarization of documentation
  - Vector database integration for retrieval-augmented generation
