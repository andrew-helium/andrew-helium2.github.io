export type VibeTool = 'Claude' | 'Lovable' | 'v0' | 'Bolt' | 'Other';

export interface SimpleProject {
  id: string;
  title: string;
  author: string;
  tool: VibeTool;
  description: string;
  /** Either 'code' (pasted HTML/JS from Claude/ChatGPT) or 'url' (live link from Lovable/v0) */
  type: 'code' | 'url';
  code?: string;
  url?: string;
  prompt?: string;
  createdAt: string;
}
