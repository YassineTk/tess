# Tess - UI Patterns 2 Assistant

An AI assistant specialized in Drupal UI Patterns 2, helping developers understand and generate UI Pattern components.

## Setup

### Prerequisites
- Node.js (v18+)
- npm (v6+)
- Anthropic API key with Claude 3.7 Sonnet access

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
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000
```

4. **Start the server**
```bash
npm start
```
