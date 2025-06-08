/**
 * Word Bank for Skrawl Drawing Game
 * Contains default word lists for different languages and difficulties
 */

// English word bank (default)
const ENGLISH_WORDS = {
  easy: [
    'cat', 'dog', 'car', 'sun', 'moon', 'tree', 'house', 'book', 'fish', 'bird',
    'ball', 'cake', 'star', 'flower', 'apple', 'chair', 'table', 'door', 'window', 'bed',
    'hat', 'shoe', 'hand', 'eye', 'nose', 'mouth', 'ear', 'hair', 'foot', 'leg',
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown',
    'big', 'small', 'hot', 'cold', 'happy', 'sad', 'fast', 'slow', 'old', 'new'
  ],
  medium: [
    'elephant', 'butterfly', 'rainbow', 'mountain', 'ocean', 'forest', 'castle', 'dragon',
    'princess', 'knight', 'wizard', 'treasure', 'adventure', 'journey', 'mystery', 'magic',
    'guitar', 'piano', 'violin', 'trumpet', 'drums', 'microphone', 'camera', 'computer',
    'telephone', 'television', 'refrigerator', 'bicycle', 'motorcycle', 'airplane', 'helicopter', 'rocket',
    'sandwich', 'pizza', 'hamburger', 'ice cream', 'chocolate', 'cookie', 'birthday', 'party',
    'vacation', 'beach', 'swimming', 'dancing', 'singing', 'painting', 'reading', 'writing',
    'doctor', 'teacher', 'firefighter', 'police', 'farmer', 'chef', 'artist', 'musician'
  ],
  hard: [
    'constellation', 'archaeology', 'philosophy', 'democracy', 'revolution', 'evolution',
    'photosynthesis', 'metamorphosis', 'hibernation', 'migration', 'ecosystem', 'biodiversity',
    'architecture', 'engineering', 'mathematics', 'geometry', 'algebra', 'calculus',
    'psychology', 'sociology', 'anthropology', 'geography', 'astronomy', 'meteorology',
    'entrepreneur', 'innovation', 'technology', 'artificial intelligence', 'virtual reality',
    'cryptocurrency', 'blockchain', 'sustainability', 'renewable energy', 'climate change',
    'globalization', 'urbanization', 'industrialization', 'civilization', 'renaissance',
    'impressionism', 'surrealism', 'minimalism', 'contemporary', 'traditional'
  ],
  phrases: [
    'happy birthday', 'good morning', 'thank you', 'excuse me', 'how are you',
    'see you later', 'good luck', 'sweet dreams', 'have fun', 'take care',
    'break a leg', 'piece of cake', 'hit the road', 'spill the beans', 'break the ice',
    'bite the bullet', 'cost an arm and a leg', 'once in a blue moon', 'raining cats and dogs',
    'the early bird', 'kill two birds', 'let the cat out', 'don\'t count your chickens',
    'a picture is worth', 'actions speak louder', 'better late than never', 'don\'t judge a book',
    'every cloud has', 'fortune favors the bold', 'great minds think alike', 'home is where'
  ]
};

// Additional language support (can be expanded)
const SPANISH_WORDS = {
  easy: [
    'gato', 'perro', 'casa', 'sol', 'luna', 'árbol', 'libro', 'pez', 'pájaro', 'pelota',
    'pastel', 'estrella', 'flor', 'manzana', 'silla', 'mesa', 'puerta', 'ventana', 'cama',
    'sombrero', 'zapato', 'mano', 'ojo', 'nariz', 'boca', 'oreja', 'pelo', 'pie', 'pierna'
  ],
  medium: [
    'elefante', 'mariposa', 'arcoíris', 'montaña', 'océano', 'bosque', 'castillo', 'dragón',
    'princesa', 'caballero', 'mago', 'tesoro', 'aventura', 'viaje', 'misterio', 'magia'
  ],
  hard: [
    'constelación', 'arqueología', 'filosofía', 'democracia', 'revolución', 'evolución',
    'fotosíntesis', 'metamorfosis', 'hibernación', 'migración', 'ecosistema', 'biodiversidad'
  ],
  phrases: [
    'buenos días', 'buenas noches', 'muchas gracias', 'de nada', 'por favor',
    'lo siento', 'hasta luego', 'buen viaje', 'feliz cumpleaños', 'que tengas suerte'
  ]
};

// Word difficulty levels
export enum WordDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  PHRASES = 'phrases',
  MIXED = 'mixed'
}

// Supported languages
export enum Language {
  ENGLISH = 'english',
  SPANISH = 'spanish'
}

// Word bank interface
interface WordBank {
  [Language.ENGLISH]: typeof ENGLISH_WORDS;
  [Language.SPANISH]: typeof SPANISH_WORDS;
}

// Complete word bank
const WORD_BANK: WordBank = {
  [Language.ENGLISH]: ENGLISH_WORDS,
  [Language.SPANISH]: SPANISH_WORDS
};

/**
 * Word Bank Service
 */
export class WordBankService {
  
  /**
   * Get random words for word selection
   */
  static getWordChoices(
    language: Language = Language.ENGLISH,
    difficulty: WordDifficulty = WordDifficulty.MIXED,
    count: number = 3
  ): string[] {
    const wordBank = WORD_BANK[language];
    if (!wordBank) {
      throw new Error(`Language ${language} not supported`);
    }

    let wordPool: string[] = [];

    // Build word pool based on difficulty
    switch (difficulty) {
      case WordDifficulty.EASY:
        wordPool = [...wordBank.easy];
        break;
      case WordDifficulty.MEDIUM:
        wordPool = [...wordBank.medium];
        break;
      case WordDifficulty.HARD:
        wordPool = [...wordBank.hard];
        break;
      case WordDifficulty.PHRASES:
        wordPool = [...wordBank.phrases];
        break;
      case WordDifficulty.MIXED:
      default:
        // Mix all difficulties with weighted distribution
        wordPool = [
          ...wordBank.easy,
          ...wordBank.easy, // Easy words appear twice (higher chance)
          ...wordBank.medium,
          ...wordBank.hard.slice(0, 10), // Only first 10 hard words
          ...wordBank.phrases.slice(0, 5) // Only first 5 phrases
        ];
        break;
    }

    // Shuffle and select random words
    const shuffled = this.shuffleArray([...wordPool]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Get a single random word
   */
  static getRandomWord(
    language: Language = Language.ENGLISH,
    difficulty: WordDifficulty = WordDifficulty.MIXED
  ): string {
    const choices = this.getWordChoices(language, difficulty, 1);
    return choices[0] || 'drawing'; // Fallback word
  }

  /**
   * Validate custom words
   */
  static validateCustomWords(words: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const word of words) {
      const trimmed = word.trim();
      
      // Check length (1-32 characters)
      if (trimmed.length < 1 || trimmed.length > 32) {
        invalid.push(word);
        continue;
      }

      // Check for valid characters (letters, spaces, hyphens, apostrophes)
      if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
        invalid.push(word);
        continue;
      }

      // Check for profanity (basic check - can be expanded)
      if (this.containsProfanity(trimmed)) {
        invalid.push(word);
        continue;
      }

      valid.push(trimmed);
    }

    return { valid, invalid };
  }

  /**
   * Parse custom words from string input
   */
  static parseCustomWords(input: string): string[] {
    return input
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }

  /**
   * Get word pattern for display (underscores for letters)
   */
  static getWordPattern(word: string): string {
    return word
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        if (char === '-') return '-';
        if (char === "'") return "'";
        return '_';
      })
      .join('');
  }

  /**
   * Reveal a hint letter in the word pattern
   */
  static revealHint(word: string, currentPattern: string): string {
    const wordChars = word.toLowerCase().split('');
    const patternChars = currentPattern.split('');
    
    // Find unrevealed letter positions
    const unrevealedPositions: number[] = [];
    for (let i = 0; i < wordChars.length; i++) {
      if (patternChars[i] === '_') {
        unrevealedPositions.push(i);
      }
    }

    if (unrevealedPositions.length === 0) {
      return currentPattern; // All letters already revealed
    }

    // Pick random unrevealed position
    const randomIndex = Math.floor(Math.random() * unrevealedPositions.length);
    const positionToReveal = unrevealedPositions[randomIndex];
    const letterToReveal = wordChars[positionToReveal];

    // Reveal all instances of this letter
    for (let i = 0; i < wordChars.length; i++) {
      if (wordChars[i] === letterToReveal) {
        patternChars[i] = word[i]; // Preserve original case
      }
    }

    return patternChars.join('');
  }

  /**
   * Check if guess matches the word
   */
  static validateGuess(guess: string, word: string): boolean {
    // Normalize both strings (lowercase, trim, remove extra spaces)
    const normalizedGuess = guess.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedWord = word.toLowerCase().trim().replace(/\s+/g, ' ');
    
    return normalizedGuess === normalizedWord;
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguages(): Language[] {
    return Object.values(Language);
  }

  /**
   * Get available difficulties
   */
  static getAvailableDifficulties(): WordDifficulty[] {
    return Object.values(WordDifficulty);
  }

  /**
   * Shuffle array utility
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Comprehensive profanity check for word validation
   */
  private static containsProfanity(word: string): boolean {
    const profanityList = [
      // Basic profanity
      'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'crap',
      // Strong profanity
      'bastard', 'whore', 'slut', 'piss', 'cock', 'dick', 'pussy',
      // Racial slurs (comprehensive list)
      'nigga', 'nigger', 'chink', 'gook', 'spic', 'wetback', 'beaner',
      'kike', 'hymie', 'raghead', 'towelhead', 'camel jockey',
      'cracker', 'honky', 'whitey', 'redneck',
      // Homophobic slurs
      'fag', 'faggot', 'dyke', 'queer',
      // Other offensive terms
      'retard', 'retarded', 'nazi', 'hitler',
      // Common variations and misspellings
      'fuk', 'fck', 'sht', 'btch', 'dmn'
    ];

    const lowerWord = word.toLowerCase();
    // Use word boundaries to match only complete words, not partial matches
    return profanityList.some(profane => {
      const regex = new RegExp(`\\b${profane}\\b`, 'i');
      return regex.test(lowerWord);
    });
  }
}

export default WordBankService;
