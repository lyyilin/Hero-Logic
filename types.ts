
export enum NodeType {
  START = 'START',
  ENCOUNTER = 'ENCOUNTER',
  CONDITION = 'CONDITION',
  MANA_CONDITION = 'MANA_CONDITION',
  ACTION = 'ACTION',
  CHARGE = 'CHARGE',
  ULTIMATE = 'ULTIMATE',
  VICTORY = 'VICTORY'
}

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  color: string;
  icon?: string;
  x: number;
  y: number;
  nextId?: string;
  yesId?: string;
  noId?: string;
}

export interface LevelDefinition {
  id: number;
  title: string;
  objective: string;
  tip: string;
  monsterHP: number;
  allowedBlocks: NodeType[];
  requiredNodes: NodeType[];
}

export interface GameState {
  heroHP: number;
  heroMana: number;
  monsterHP: number;
  isFighting: boolean;
  currentStep: string | null;
  logs: string[];
  battleResult: 'WIN' | 'LOSS' | 'NONE';
  currentLevelIndex: number;
}
