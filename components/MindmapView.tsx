import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NewsItem, PolicyAnalysis } from '../types';
import { Network, BrainCircuit, Users, AlertCircle, Lightbulb, Gavel, BookOpen, Target } from 'lucide-react';

interface MindmapViewProps {
  item: NewsItem;
  analysis: PolicyAnalysis;
}

// Custom Node Component for a more "Executive Dashboard" look
const CustomNode = ({ data }: { data: { label: string; icon: React.ReactNode; color: string; desc?: string; isRoot?: boolean } }) => {
  return (
    <div className={`px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[24px] border-2 bg-white/95 backdrop-blur-md ${data.color} ${data.isRoot ? 'min-w-[240px]' : 'min-w-[200px]'} max-w-[320px] transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 group`}>
      <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-slate-100 !border-4 !border-white !-top-2 shadow-sm" />
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl text-white shadow-xl transition-transform group-hover:rotate-6 ${data.color.replace('border-', 'bg-').split(' ')[0]}`}>
          {data.icon}
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5 leading-none">{data.label}</div>
          <div className={`${data.isRoot ? 'text-base' : 'text-sm'} font-black leading-tight text-slate-900 line-clamp-3`}>
            {data.desc}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-slate-100 !border-4 !border-white !-bottom-2 shadow-sm" />
    </div>
  );
};

// Simplified Sub-node for items like stakeholders or regulations
const SubNode = ({ data }: { data: { label: string; color: string } }) => (
  <div className={`px-4 py-2 rounded-2xl border-2 shadow-sm bg-white text-[11px] font-extrabold text-slate-700 whitespace-nowrap ${data.color} transition-all hover:scale-105`}>
    <Handle type="target" position={Position.Top} className="!opacity-0" />
    {data.label}
  </div>
);

const nodeTypes = {
  custom: CustomNode,
  sub: SubNode,
};

const MindmapView: React.FC<MindmapViewProps> = ({ item, analysis }) => {
  
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Common edge style
    const edgeStyle = {
      stroke: '#e2e8f0',
      strokeWidth: 2,
    };

    // 1. Root Node (Core Problem)
    initialNodes.push({
      id: 'root',
      type: 'custom',
      data: { 
        label: 'Isu Utama', 
        icon: <BrainCircuit size={20} />, 
        color: 'border-indigo-500',
        desc: analysis.coreProblem,
        isRoot: true 
      },
      position: { x: 400, y: 0 },
    });

    // 2. Root Cause
    initialNodes.push({
      id: 'cause',
      type: 'custom',
      data: { 
        label: 'Analisis Akar', 
        icon: <AlertCircle size={20} />, 
        color: 'border-rose-500',
        desc: analysis.rootCause 
      },
      position: { x: -100, y: 220 },
    });
    initialEdges.push({ 
      id: 'e-root-cause', 
      source: 'root', 
      target: 'cause', 
      label: 'Disebabkan Oleh',
      labelStyle: { fill: '#f43f5e', fontWeight: 800, fontSize: 10 },
      animated: true, 
      style: { stroke: '#f43f5e', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } 
    });

    // 3. Stakeholders
    initialNodes.push({
      id: 'stakeholders',
      type: 'custom',
      data: { 
        label: 'Pemangku Kepentingan', 
        icon: <Users size={20} />, 
        color: 'border-amber-500',
        desc: `${analysis.stakeholders.length} Pihak Terkait` 
      },
      position: { x: 300, y: 220 },
    });
    initialEdges.push({ 
      id: 'e-root-stake', 
      source: 'root', 
      target: 'stakeholders', 
      label: 'Melibatkan',
      labelStyle: { fill: '#f59e0b', fontWeight: 800, fontSize: 10 },
      style: edgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#e2e8f0' } 
    });

    // Sub-nodes for stakeholders
    analysis.stakeholders.forEach((s, i) => {
      const id = `stake-${i}`;
      initialNodes.push({
        id,
        type: 'sub',
        data: { label: s, color: 'border-amber-200 bg-amber-50/50' },
        position: { x: 320 + (i * 120), y: 320 },
      });
      initialEdges.push({ id: `e-stake-${i}`, source: 'stakeholders', target: id, style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4' } });
    });

    // 4. Implications
    initialNodes.push({
      id: 'implications',
      type: 'custom',
      data: { 
        label: 'Dampak & Implikasi', 
        icon: <Network size={20} />, 
        color: 'border-violet-500',
        desc: analysis.implications 
      },
      position: { x: 900, y: 220 },
    });
    initialEdges.push({ 
      id: 'e-root-impl', 
      source: 'root', 
      target: 'implications', 
      label: 'Berdampak Pada',
      labelStyle: { fill: '#8b5cf6', fontWeight: 800, fontSize: 10 },
      style: edgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#e2e8f0' } 
    });

    // 5. Policy Options
    initialNodes.push({
      id: 'options',
      type: 'custom',
      data: { 
        label: 'Opsi Alternatif', 
        icon: <Lightbulb size={20} />, 
        color: 'border-cyan-500',
        desc: 'Pilihan Kebijakan Lain' 
      },
      position: { x: -100, y: 480 },
    });
    initialEdges.push({ 
      id: 'e-root-opt', 
      source: 'root', 
      target: 'options', 
      label: 'Opsi Mitigasi',
      labelStyle: { fill: '#06b6d4', fontWeight: 800, fontSize: 10 },
      style: edgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#e2e8f0' } 
    });

    analysis.policyOptions.forEach((opt, i) => {
      const id = `opt-${i}`;
      initialNodes.push({
        id,
        type: 'sub',
        data: { label: opt, color: 'border-cyan-200 bg-cyan-50/50' },
        position: { x: -150 + (i * 220), y: 580 },
      });
      initialEdges.push({ id: `e-opt-${i}`, source: 'options', target: id, style: { stroke: '#06b6d4', strokeWidth: 1.5, strokeDasharray: '4' } });
    });

    // 6. Recommendation
    initialNodes.push({
      id: 'recommendation',
      type: 'custom',
      data: { 
        label: 'Solusi Strategis', 
        icon: <Target size={20} />, 
        color: 'border-emerald-500',
        desc: analysis.recommendation 
      },
      position: { x: 400, y: 480 },
    });
    initialEdges.push({ 
      id: 'e-root-rec', 
      source: 'root', 
      target: 'recommendation', 
      label: 'Rekomendasi Utama',
      labelStyle: { fill: '#10b981', fontWeight: 900, fontSize: 11 },
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 4 }, 
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } 
    });

    // 7. Regulations & Theory
    initialNodes.push({
      id: 'legal',
      type: 'custom',
      data: { 
        label: 'Landasan Hukum', 
        icon: <Gavel size={20} />, 
        color: 'border-slate-500',
        desc: 'Dasar Aturan & Regulasi' 
      },
      position: { x: 900, y: 480 },
    });
    initialEdges.push({ 
      id: 'e-root-legal', 
      source: 'root', 
      target: 'legal',
      label: 'Didasari Oleh',
      labelStyle: { fill: '#64748b', fontWeight: 800, fontSize: 10 },
      style: edgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#e2e8f0' } 
    });

    analysis.relevantRegulations.slice(0, 3).forEach((reg, i) => {
      const id = `reg-${i}`;
      initialNodes.push({
        id,
        type: 'sub',
        data: { label: reg, color: 'border-slate-300 bg-slate-100/50' },
        position: { x: 750 + (i * 120), y: 520 },
      });
      initialEdges.push({ id: `e-reg-${i}`, source: 'legal', target: id, style: { stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '4' } });
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [analysis]);

  return (
    <div className="w-full h-full min-h-[650px] bg-slate-50/50 rounded-[40px] border border-slate-200 overflow-hidden relative shadow-inner">
      {/* Informational Panel */}
      <div className="absolute top-8 left-8 z-10">
         <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-white/50 max-w-[340px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <BrainCircuit size={20} />
              </div>
              <h4 className="font-black text-slate-900 text-lg tracking-tight">Eksplorasi Kebijakan</h4>
            </div>
            <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">
              Visualisasi relasional dari hasil analisis mendalam AI. Menghubungkan masalah inti dengan landasan hukum dan solusi konkret.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-widest">Penyebab</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">Solusi</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest">Aktor</span>
            </div>
         </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="touch-none"
      >
        <Background color="#cbd5e1" gap={30} size={1} />
        <Controls showInteractive={false} className="!bg-white/80 !backdrop-blur-md !border-slate-200 !rounded-2xl !p-1 !overflow-hidden !shadow-2xl !bottom-8 !right-8" />
      </ReactFlow>
    </div>
  );
};

export default MindmapView;
