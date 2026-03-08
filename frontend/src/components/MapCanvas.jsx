import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import axios from 'axios';
import NodeSidebar from './NodeSidebar';

const API_BASE = 'http://localhost:8000';

const nodeStyles = {
  unlocked: "bg-slate-800 border-2 border-blue-500 text-white",
  locked: "bg-slate-900 border-2 border-slate-800 text-slate-600 opacity-50 grayscale",
  completed: "bg-emerald-900/30 border-2 border-emerald-500 text-emerald-400 font-bold"
};

export default function MapCanvas({ routeId, username, progress, onProgressUpdate }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/route-maps/${routeId}/nodes`);
      const rawNodes = res.data;
      
      // Transform nodes for React Flow
      const rfNodes = rawNodes.map((n) => {
        const isCompleted = progress[n.id];
        
        // Check if unlocked: parent is null or parent is completed
        const isUnlocked = !n.parent_id || progress[n.parent_id];
        
        // Hide if locked (as per requirements)
        // Actually, requirement says "hidden if node B was not obtained yet"
        const isHidden = !isUnlocked;

        return {
          id: n.id.toString(),
          position: { x: n.level * 250, y: Math.random() * 400 + (n.level * 100) }, // Basic layout
          data: { label: n.title, original: n, isUnlocked, isCompleted },
          className: `p-4 rounded-xl shadow-lg transition-all duration-500 w-48 text-center cursor-pointer ${
            isCompleted ? nodeStyles.completed : (isUnlocked ? nodeStyles.unlocked : nodeStyles.locked)
          }`,
          hidden: isHidden
        };
      });

      // Simple tree layout calculation
      // For a real app, use a layout engine like dagre
      // Here I'll just group by level and spread Y
      const levelCounts = {};
      rfNodes.forEach(n => {
        const lv = n.data.original.level;
        levelCounts[lv] = (levelCounts[lv] || 0) + 1;
        n.position = { x: lv * 300, y: levelCounts[lv] * 120 };
      });

      const rfEdges = rawNodes
        .filter(n => n.parent_id)
        .map(n => ({
          id: `e-${n.parent_id}-${n.id}`,
          source: n.parent_id.toString(),
          target: n.id.toString(),
          animated: progress[n.parent_id] && !progress[n.id],
          style: { stroke: progress[n.parent_id] ? '#10b981' : '#475569', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: progress[n.parent_id] ? '#10b981' : '#475569' },
          hidden: !progress[n.parent_id] && !progress[n.id] // Hide edge if target is hidden
        }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    } catch (err) {
      console.error("Failed to fetch nodes", err);
    } finally {
      setLoading(false);
    }
  }, [routeId, progress, setNodes, setEdges]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const onNodeClick = (event, node) => {
    setSelectedNode(node.data.original);
  };

  return (
    <div className="w-full h-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background color="#334155" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => n.data.isCompleted ? '#10b981' : '#3b82f6'}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
        />
      </ReactFlow>

      {selectedNode && (
        <NodeSidebar 
          node={selectedNode} 
          username={username}
          isCompleted={!!progress[selectedNode.id]}
          onClose={() => setSelectedNode(null)}
          onUpdate={() => {
            onProgressUpdate();
            // selectedNode doesn't update automatically here if sidebar is open
            // but we can close it or update its local state
          }}
        />
      )}
    </div>
  );
}
