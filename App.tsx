import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, RotateCcw, Swords, Code, Terminal, Sparkles, BrainCircuit } from 'lucide-react';
import { NodeType, FlowNode, GameState } from './types';
import { BLOCK_TEMPLATES, LEVELS, ATTACK_DAMAGE, ULTIMATE_DAMAGE, MANA_COST_ULTIMATE, MANA_GAIN_CHARGE } from './constants';
import GameArena from './components/GameArena';
import FlowchartCanvas from './components/FlowchartCanvas';

const App: React.FC = () => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = LEVELS[currentLevelIdx];
  const [showCode, setShowCode] = useState(true);

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    heroHP: 100,
    heroMana: 0,
    monsterHP: currentLevel.monsterHP,
    isFighting: false,
    currentStep: null,
    logs: ["冒险者，规划你的逻辑！"],
    battleResult: 'NONE',
    currentLevelIndex: 0
  });
  
  const stateRef = useRef<GameState>(gameState);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  const [isExecuting, setIsExecuting] = useState(false);
  const executionTimerRef = useRef<number | null>(null);

  // --- Code Preview Generator (Python) ---
  const generatePythonCode = () => {
    if (nodes.length === 0) return "# 尚未定义逻辑流程...";
    
    let python = "import hero_rpg\n\n";
    python += "def battle_loop():\n";
    python += "    hero = hero_rpg.Hero()\n";
    python += "    monster = hero_rpg.Monster(hp=" + currentLevel.monsterHP + ")\n\n";

    const visited = new Set<string>();
    const getNextLine = (nodeId: string, indent = "    "): string => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return "";
      
      if (visited.has(nodeId)) {
        return `${indent}# ... (循环中)\n`;
      }
      visited.add(nodeId);
      
      let line = "";
      switch (node.type) {
        case NodeType.ENCOUNTER:
          line = `${indent}print('找到目标！')\n`;
          if (node.nextId) line += getNextLine(node.nextId, indent);
          break;
        case NodeType.ACTION:
          line = `${indent}hero.attack(monster)\n`;
          if (node.nextId) line += getNextLine(node.nextId, indent);
          break;
        case NodeType.CHARGE:
          line = `${indent}hero.charge_mana()\n`;
          if (node.nextId) line += getNextLine(node.nextId, indent);
          break;
        case NodeType.ULTIMATE:
          line = `${indent}hero.cast_ultimate(monster)\n`;
          if (node.nextId) line += getNextLine(node.nextId, indent);
          break;
        case NodeType.CONDITION:
          line = `${indent}while monster.is_alive():\n`;
          if (node.yesId) line += getNextLine(node.yesId, indent + "    ");
          if (node.noId) line += getNextLine(node.noId, indent);
          break;
        case NodeType.MANA_CONDITION:
          line = `${indent}if hero.mana >= 40:\n`;
          if (node.yesId) line += getNextLine(node.yesId, indent + "    ");
          if (node.noId) {
            line += `${indent}else:\n`;
            line += getNextLine(node.noId, indent + "    ");
          }
          break;
        case NodeType.VICTORY:
          line = `${indent}print('战斗胜利！')\n`;
          break;
      }
      return line;
    };

    const startNode = nodes.find(n => n.type === NodeType.ENCOUNTER);
    if (startNode) python += getNextLine(startNode.id);
    else python += "    # 请先放入'遭遇怪兽'积木作为入口";
    
    return python;
  };

  const loadLevel = (idx: number) => {
    if (isExecuting) return;
    const level = LEVELS[idx];
    setCurrentLevelIdx(idx);
    setNodes([]);
    setGameState({
      heroHP: 100,
      heroMana: 0,
      monsterHP: level.monsterHP,
      isFighting: false,
      currentStep: null,
      logs: [`进入关卡：${level.title}`],
      battleResult: 'NONE',
      currentLevelIndex: idx
    });
  };

  const addBlock = (type: NodeType) => {
    if (gameState.isFighting) return;
    const template = BLOCK_TEMPLATES.find(t => t.type === type);
    if (!template) return;

    const newNode: FlowNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: template.label,
      color: template.color,
      x: 50,
      y: 100 + (nodes.length * 40)
    };

    setNodes(prev => [...prev, newNode]);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const handleConnect = (fromId: string, toId: string, type: 'next' | 'yes' | 'no') => {
    setNodes(prev => prev.map(node => {
      if (node.id === fromId) {
        if (type === 'next') return { ...node, nextId: toId };
        if (type === 'yes') return { ...node, yesId: toId };
        if (type === 'no') return { ...node, noId: toId };
      }
      return node;
    }));
  };

  const resetGame = () => {
    setIsExecuting(false);
    if (executionTimerRef.current) window.clearTimeout(executionTimerRef.current);
    const initialState: GameState = {
      ...gameState,
      heroHP: 100,
      heroMana: 0,
      monsterHP: currentLevel.monsterHP,
      isFighting: false,
      currentStep: null,
      logs: ["系统已重置，等待运行。"],
      battleResult: 'NONE'
    };
    setGameState(initialState);
    stateRef.current = initialState;
  };

  const executeStep = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      setIsExecuting(false);
      const isActuallyVictory = stateRef.current.monsterHP === 0;
      setGameState(prev => ({ 
        ...prev, 
        isFighting: false, 
        currentStep: null,
        logs: [...prev.logs, isActuallyVictory ? "怪兽已死，但你没连‘胜利’积木！" : "流程中断，没有后续节点。"] 
      }));
      return;
    }

    const s = stateRef.current;
    
    // Safety check: if monster is dead, only allow branching from conditions or Victory itself
    if (s.monsterHP <= 0 && node.type !== NodeType.CONDITION && node.type !== NodeType.VICTORY) {
      // Look for a condition node that can exit or just stop
      setIsExecuting(false);
      setGameState(prev => ({ 
        ...prev, 
        isFighting: false, 
        currentStep: null,
        logs: [...prev.logs, "怪兽已死亡，系统自动停止指令集执行。"] 
      }));
      return;
    }

    let nextNodeId: string | undefined = undefined;
    let log = "";
    let dmg = 0;
    let manaDelta = 0;

    switch (node.type) {
      case NodeType.ENCOUNTER:
        log = "战斗开始！目标已进入视野。";
        nextNodeId = node.nextId;
        break;
      case NodeType.CONDITION:
        const alive = s.monsterHP > 0;
        log = alive ? "判定：怪兽仍然存活..." : "判定：怪兽已被消灭！";
        nextNodeId = alive ? node.yesId : node.noId;
        break;
      case NodeType.MANA_CONDITION:
        const hasMana = s.heroMana >= MANA_COST_ULTIMATE;
        log = hasMana ? "系统：法力足够释放奥义！" : "系统：法力不足。";
        nextNodeId = hasMana ? node.yesId : node.noId;
        break;
      case NodeType.ACTION:
        log = `执行：普通斩击！伤害 ${ATTACK_DAMAGE}`;
        dmg = ATTACK_DAMAGE;
        nextNodeId = node.nextId;
        break;
      case NodeType.CHARGE:
        log = `执行：魔法蓄力... +${MANA_GAIN_CHARGE}MP`;
        manaDelta = MANA_GAIN_CHARGE;
        nextNodeId = node.nextId;
        break;
      case NodeType.ULTIMATE:
        if (s.heroMana >= MANA_COST_ULTIMATE) {
          log = `释放：终极奥义·破灭斩！💥 伤害 ${ULTIMATE_DAMAGE}`;
          dmg = ULTIMATE_DAMAGE;
          manaDelta = -MANA_COST_ULTIMATE;
        } else {
          log = "警告：法力不足，施法中断！";
        }
        nextNodeId = node.nextId;
        break;
      case NodeType.VICTORY:
        log = "核心指令：任务完成，恭喜胜利！";
        nextNodeId = undefined;
        break;
    }

    setGameState(prev => {
        const nextHP = Math.max(0, prev.monsterHP - dmg);
        const nextMana = Math.min(100, Math.max(0, prev.heroMana + manaDelta));
        const newState = {
            ...prev,
            currentStep: nodeId,
            monsterHP: nextHP,
            heroMana: nextMana,
            logs: [...prev.logs, log],
            battleResult: node.type === NodeType.VICTORY ? 'WIN' : (prev.battleResult)
        };
        stateRef.current = newState;
        return newState;
    });

    // Check if next exists and continue, otherwise stop
    if (nextNodeId) {
      // If we killed it, and the next node is NOT the loop condition check, maybe we should stop?
      // Actually, we'll let the user logic play out, but if they get stuck in a loop of Actions when monster is dead,
      // the safety check at the top of executeStep will catch it on the next frame.
      executionTimerRef.current = window.setTimeout(() => executeStep(nextNodeId!), 600);
    } else {
      setIsExecuting(false);
      setGameState(prev => ({ 
        ...prev, 
        isFighting: false, 
        currentStep: null 
      }));
    }
  }, [nodes]);

  const startBattle = () => {
    if (isExecuting) return;
    const startNode = nodes.find(n => n.type === NodeType.ENCOUNTER);
    if (!startNode) {
      setGameState(prev => ({ ...prev, logs: [...prev.logs, "逻辑错误：请添加'遭遇怪兽'作为起始点！"] }));
      return;
    }
    setIsExecuting(true);
    setGameState(prev => ({ 
      ...prev, 
      isFighting: true, 
      heroMana: 0, 
      monsterHP: currentLevel.monsterHP,
      logs: ["初始化战斗逻辑序列..."],
      battleResult: 'NONE'
    }));
    stateRef.current = { 
      heroHP: 100,
      heroMana: 0, 
      monsterHP: currentLevel.monsterHP,
      isFighting: true,
      currentStep: startNode.id,
      logs: ["初始化战斗逻辑序列..."],
      battleResult: 'NONE',
      currentLevelIndex: currentLevelIdx
    };
    executeStep(startNode.id);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] text-slate-100 font-sans overflow-hidden">
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Swords size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-indigo-400">Logic Lab <span className="text-[10px] text-slate-600 ml-1">v2.8</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Mission_{currentLevel.id}: {currentLevel.title}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showCode ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-transparent border-slate-700 text-slate-500'}`}
          >
            <Code size={14} /> Python View
          </button>
          <button 
            onClick={startBattle}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-xs font-black uppercase transition-all shadow-lg ${isExecuting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/30 active:scale-95'}`}
          >
            <Play size={14} fill="currentColor" /> Run Execution
          </button>
          <button 
            onClick={resetGame}
            className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors hover:bg-slate-700"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 overflow-y-auto z-40 shadow-2xl">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
             积木库 Library
           </h3>
           <div className="flex flex-col gap-3">
             {BLOCK_TEMPLATES.map(t => {
               const allowed = currentLevel.allowedBlocks.includes(t.type);
               return (
                 <button
                   key={t.type}
                   onClick={() => allowed && addBlock(t.type)}
                   disabled={!allowed || isExecuting}
                   className={`w-full p-2.5 rounded-xl border-2 text-left transition-all group ${allowed ? 'border-slate-800 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800 hover:scale-[1.02]' : 'opacity-20 cursor-not-allowed border-transparent grayscale'}`}
                 >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${t.color} text-slate-900 shadow-sm group-hover:scale-110 transition-transform`}>{t.icon}</div>
                      <span className="text-[11px] font-black tracking-tight">{t.label}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium leading-tight group-hover:text-slate-400 transition-colors">{t.description}</p>
                 </button>
               )
             })}
           </div>

           <div className="mt-auto pt-6">
              <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl backdrop-blur-sm">
                 <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <BrainCircuit size={16} />
                    <span className="text-[11px] font-black uppercase tracking-wider">专家提示 Insight</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">{currentLevel.tip}</p>
              </div>
           </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <GameArena state={gameState} maxMonsterHP={currentLevel.monsterHP} />
          
          <div className="flex-1 flex overflow-hidden bg-[#020617]">
            <FlowchartCanvas 
              nodes={nodes} 
              onRemoveNode={(id) => setNodes(n => n.filter(node => node.id !== id))} 
              onUpdateNodePosition={updateNodePosition}
              onConnect={handleConnect}
              activeNodeId={gameState.currentStep} 
            />

            {showCode && (
              <div className="w-80 bg-[#010413] border-l border-slate-800 flex flex-col shadow-2xl z-20">
                <div className="h-10 bg-slate-900/80 px-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">hero_script.py</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">CODE_SYNC</div>
                </div>
                <div className="flex-1 p-6 font-mono text-[11px] overflow-auto">
                  <pre className="text-emerald-400/80 whitespace-pre-wrap leading-relaxed selection:bg-emerald-500/30">
                    <code>{generatePythonCode()}</code>
                  </pre>
                </div>
                <div className="p-4 bg-indigo-500/5 text-[9px] text-indigo-400/60 italic text-center border-t border-slate-800 uppercase tracking-tighter">
                  Real-time Syntax Mapping: Node to Python
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="h-10 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-center gap-4">
         {LEVELS.map((lvl, idx) => (
           <button
            key={lvl.id}
            onClick={() => loadLevel(idx)}
            className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${idx === currentLevelIdx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600 hover:text-slate-400 bg-slate-900/50 hover:bg-slate-800'}`}
           >
            STAGE_{lvl.id}
           </button>
         ))}
      </footer>

      {gameState.battleResult === 'WIN' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-700">
          <div className="bg-slate-900 border-2 border-indigo-500/30 p-12 rounded-[2rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] text-center max-w-sm border-t-indigo-500/50">
             <div className="text-7xl mb-6 animate-bounce">⚔️</div>
             <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">STAGE CLEARED</h2>
             <p className="text-slate-400 text-sm mb-10 leading-relaxed font-bold">逻辑流已闭合。你编写的指令集成功击败了强敌，继续磨炼你的编程技艺吧！</p>
             <button 
              onClick={() => currentLevelIdx < LEVELS.length - 1 ? loadLevel(currentLevelIdx + 1) : resetGame()}
              className="w-full bg-indigo-500 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
             >
              {currentLevelIdx < LEVELS.length - 1 ? 'Unlock Next Challenge' : 'Reset Workspace'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;