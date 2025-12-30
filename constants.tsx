
import React from 'react';
import { Sword, Search, Trophy, HelpCircle, Zap, Flame, BatteryCharging } from 'lucide-react';
import { NodeType, LevelDefinition } from './types';

export const BLOCK_TEMPLATES = [
  {
    type: NodeType.ENCOUNTER,
    label: '遭遇怪兽',
    color: 'bg-indigo-400',
    icon: <Search size={18} className="mr-2" />,
    description: '寻找并锁定一个敌人'
  },
  {
    type: NodeType.CONDITION,
    label: '怪兽活着吗？',
    color: 'bg-yellow-400',
    icon: <HelpCircle size={18} className="mr-2" />,
    description: 'If monster.hp > 0'
  },
  {
    type: NodeType.MANA_CONDITION,
    label: '法力足够吗？',
    color: 'bg-blue-400',
    icon: <Zap size={18} className="mr-2" />,
    description: 'If mana >= 40'
  },
  {
    type: NodeType.ACTION,
    label: '普通攻击',
    color: 'bg-red-400',
    icon: <Sword size={18} className="mr-2" />,
    description: '造成 25 点伤害'
  },
  {
    type: NodeType.CHARGE,
    label: '蓄力法力',
    color: 'bg-cyan-400',
    icon: <BatteryCharging size={18} className="mr-2" />,
    description: '回复 20 点法力'
  },
  {
    type: NodeType.ULTIMATE,
    label: '奥义·斩',
    color: 'bg-purple-500',
    icon: <Flame size={18} className="mr-2" />,
    description: '消耗 40 法力，造成 60 伤害'
  },
  {
    type: NodeType.VICTORY,
    label: '胜利！',
    color: 'bg-orange-400',
    icon: <Trophy size={18} className="mr-2" />,
    description: '结束战斗'
  }
];

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    title: "第一课：顺序执行",
    objective: "史莱姆只需一击。顺序排列：遭遇 -> 攻击 -> 胜利。",
    tip: "程序就像食谱，按步骤执行。试试手动拖拽方块到你喜欢的位置！",
    monsterHP: 25,
    allowedBlocks: [NodeType.ENCOUNTER, NodeType.ACTION, NodeType.VICTORY],
    requiredNodes: [NodeType.ENCOUNTER, NodeType.ACTION, NodeType.VICTORY]
  },
  {
    id: 2,
    title: "第二课：If 分支",
    objective: "怪兽变强了。判断：如果它活着，就再打一下。",
    tip: "使用黄色的判断块，它能决定代码的走向。",
    monsterHP: 50,
    allowedBlocks: [NodeType.ENCOUNTER, NodeType.CONDITION, NodeType.ACTION, NodeType.VICTORY],
    requiredNodes: [NodeType.CONDITION]
  },
  {
    id: 3,
    title: "第三课：While 循环",
    objective: "高血量敌人！让攻击‘循环’起来。",
    tip: "将攻击后的线连回判断块，形成一个闭环循环！",
    monsterHP: 100,
    allowedBlocks: [NodeType.ENCOUNTER, NodeType.CONDITION, NodeType.ACTION, NodeType.VICTORY],
    requiredNodes: [NodeType.CONDITION, NodeType.ACTION]
  },
  {
    id: 4,
    title: "第四课：高级法术逻辑",
    objective: "最终大龙！血量 150。你必须利用蓄力和奥义来获胜。",
    tip: "逻辑挑战：如果法力足够，使用奥义；否则蓄力。并放在大循环中。",
    monsterHP: 150,
    allowedBlocks: [NodeType.ENCOUNTER, NodeType.CONDITION, NodeType.MANA_CONDITION, NodeType.ACTION, NodeType.CHARGE, NodeType.ULTIMATE, NodeType.VICTORY],
    requiredNodes: [NodeType.MANA_CONDITION, NodeType.ULTIMATE, NodeType.CHARGE]
  }
];

export const ATTACK_DAMAGE = 25;
export const ULTIMATE_DAMAGE = 60;
export const MANA_COST_ULTIMATE = 40;
export const MANA_GAIN_CHARGE = 20;
