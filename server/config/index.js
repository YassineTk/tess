// Define mode constants
const MODES = {
  BASIC: 'basic',
  FULL: 'full',
  BACKEND: 'backend'
};

// File paths
const RULES_FILES = {
  [MODES.BASIC]: 'docs/frontend.md',
  [MODES.FULL]: 'docs/backend.md',
  [MODES.BACKEND]: 'docs/backend.md'
};

// Mode names for display
const MODE_NAMES = {
  [MODES.BASIC]: 'UI Pattern Generator',
  [MODES.FULL]: 'Full Documentation',
  [MODES.BACKEND]: 'Backend Integration'
};

// Session cleanup config
const SESSION_CONFIG = {
  MAX_AGE_DAYS: 30,
  MAX_MESSAGES: 50
};

module.exports = {
  MODES,
  RULES_FILES,
  MODE_NAMES,
  SESSION_CONFIG
};