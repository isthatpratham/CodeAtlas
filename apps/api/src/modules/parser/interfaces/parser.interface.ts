export interface RepositoryParser {
  parseFile(filePath: string, fileContent: string): Promise<ParsedFileResult>;
}

export interface RepositoryScanner {
  scanDirectory(dirPath: string): Promise<string[]>;
}

export interface LanguageDetector {
  detectLanguage(filePath: string): string;
}

export interface ParsedFileResult {
  imports: string[];
  exports: string[];
  size: number;
  lines: number;
}
