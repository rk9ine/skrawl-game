// Client-side validation utilities for profile management
// These complement the server-side validation for better UX

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export class ProfileValidation {
  // Username validation constants
  static readonly USERNAME_MIN_LENGTH = 3;
  static readonly USERNAME_MAX_LENGTH = 20;
  static readonly USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
  
  // Common profanity words (basic list - should be expanded)
  static readonly PROFANITY_WORDS = [
    'admin', 'moderator', 'support', 'official', 'skrawl',
    // Add more as needed
  ];

  /**
   * Validate username format (client-side)
   */
  static validateUsernameFormat(username: string): ValidationResult {
    const trimmed = username.trim();

    // Check length
    if (trimmed.length < this.USERNAME_MIN_LENGTH) {
      return {
        isValid: false,
        error: `Username must be at least ${this.USERNAME_MIN_LENGTH} characters long`
      };
    }

    if (trimmed.length > this.USERNAME_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Username must be no more than ${this.USERNAME_MAX_LENGTH} characters long`
      };
    }

    // Check pattern
    if (!this.USERNAME_PATTERN.test(trimmed)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, underscores, and dashes'
      };
    }

    // Check for reserved words
    const lowerUsername = trimmed.toLowerCase();
    if (this.PROFANITY_WORDS.includes(lowerUsername)) {
      return {
        isValid: false,
        error: 'This username is not allowed'
      };
    }

    // Check for common patterns that might be problematic
    if (lowerUsername.startsWith('admin') || lowerUsername.startsWith('mod')) {
      return {
        isValid: false,
        error: 'Username cannot start with reserved words'
      };
    }

    // Check for too many consecutive special characters
    if (/[_-]{3,}/.test(trimmed)) {
      return {
        isValid: false,
        error: 'Username cannot have more than 2 consecutive underscores or dashes'
      };
    }

    return { isValid: true };
  }

  /**
   * Generate username suggestions based on a base name
   */
  static generateSuggestions(baseName: string, existingNames: string[] = []): string[] {
    const suggestions: string[] = [];
    const cleanBase = baseName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    if (cleanBase.length < 2) {
      return ['player1', 'artist1', 'drawer1', 'creator1', 'gamer1'];
    }

    // Add numbers
    for (let i = 1; i <= 10; i++) {
      const suggestion = `${cleanBase}${i}`;
      if (suggestion.length <= this.USERNAME_MAX_LENGTH && 
          !existingNames.includes(suggestion.toLowerCase())) {
        suggestions.push(suggestion);
      }
    }

    // Add common suffixes
    const suffixes = ['_pro', '_ace', '_star', '_king', '_queen', '_master'];
    for (const suffix of suffixes) {
      const suggestion = `${cleanBase}${suffix}`;
      if (suggestion.length <= this.USERNAME_MAX_LENGTH && 
          !existingNames.includes(suggestion.toLowerCase())) {
        suggestions.push(suggestion);
      }
    }

    // Add prefixes
    const prefixes = ['pro_', 'the_', 'mr_', 'ms_'];
    for (const prefix of prefixes) {
      const suggestion = `${prefix}${cleanBase}`;
      if (suggestion.length <= this.USERNAME_MAX_LENGTH && 
          !existingNames.includes(suggestion.toLowerCase())) {
        suggestions.push(suggestion);
      }
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }

  /**
   * Check if username change is risky (similar to existing popular names)
   */
  static checkUsernameRisk(username: string): ValidationResult {
    const lowerUsername = username.toLowerCase();
    
    // Check for common gaming names that might cause confusion
    const popularNames = ['player', 'gamer', 'pro', 'noob', 'admin', 'guest'];
    
    for (const popular of popularNames) {
      if (lowerUsername.includes(popular)) {
        return {
          isValid: true,
          warning: `Username contains "${popular}" which might be confusing to other players`
        };
      }
    }

    // Check for numbers only
    if (/^\d+$/.test(username)) {
      return {
        isValid: true,
        warning: 'Username with only numbers might be hard for others to remember'
      };
    }

    // Check for very short names
    if (username.length <= 4) {
      return {
        isValid: true,
        warning: 'Short usernames might be taken by other players in the future'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate avatar data
   */
  static validateAvatar(avatarData: string): ValidationResult {
    if (!avatarData || avatarData.trim().length === 0) {
      return {
        isValid: false,
        error: 'Avatar is required'
      };
    }

    // Check if it's a valid emoji (basic check)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    
    // Check if it's an icon name (for Ionicons)
    const iconNameRegex = /^[a-z-]+$/;
    
    // Check if it's a GIF filename
    const gifRegex = /^[a-zA-Z0-9_-]+\.(gif|png|jpg|jpeg)$/i;

    if (!emojiRegex.test(avatarData) && 
        !iconNameRegex.test(avatarData) && 
        !gifRegex.test(avatarData)) {
      return {
        isValid: false,
        error: 'Invalid avatar format'
      };
    }

    return { isValid: true };
  }

  /**
   * Check network connectivity for validation
   */
  static async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize username input
   */
  static sanitizeUsername(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_-]/g, '') // Remove invalid characters
      .substring(0, this.USERNAME_MAX_LENGTH); // Truncate if too long
  }
}
