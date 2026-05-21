export type ElementType =
  | 'scene-heading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition'
  | 'shot'
  | 'general';

export interface ScriptBlock {
  id: string;
  type: ElementType;
  text: string;
  synopsis?: string;
  color?: string;
  revisionMark?: string;
}

export interface TitlePage {
  title: string;
  author: string;
  basedOn?: string;
  contact?: string;
  address?: string;
  phone?: string;
  email?: string;
  draftDate?: string;
  copyright?: string;
  wga?: string;
}

export interface Script {
  id: string;
  title: string;
  titlePage: TitlePage;
  blocks: ScriptBlock[];
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}
