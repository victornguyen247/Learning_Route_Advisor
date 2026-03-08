import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { Lock, Unlock, CheckCircle2, Star, Sparkles, BookOpen, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Loader2, Eye, EyeOff } from 'lucide-react';
import NodeSidebar from './NodeSidebar';

const API_BASE = 'http://localhost:8000';

const RoadmapNode = React.memo(({ data }) => {
  const { label, isCompleted, isUnlocked, original, onExpand } = data;
  const [expanding, setExpanding] = useState(false);
  
  const getStyles = useMemo(() => {
    if (isCompleted) return "bg-[#f8f9fa] border-[#dee2e6] text-slate-500 shadow-sm";
    if (isUnlocked) return "bg-white border-[#dee2e6] shadow-md text-slate-900";
    return "bg-[#fdfaf3]/50 border-[#e9ecef] text-slate-400 opacity-50";
  }, [isCompleted, isUnlocked]);

  const handleExpand = useCallback(async (e) => {
    e.stopPropagation();
    setExpanding(true);
    await onExpand(original.id);
    setExpanding(false);
  }, [onExpand, original.id]);

  const Icon = useMemo(() => isCompleted ? CheckCircle2 : (isUnlocked ? Sparkles : Lock), [isCompleted, isUnlocked]);

  const isRoot = original.level === 1;

  const getExpandIcon = () => {
    if (expanding) return <Loader2 className="w-4 h-4 animate-spin" />;
    const pos = data.sourcePos || Position.Right;
    if (pos === Position.Right) return <ChevronRight className="w-4 h-4" />;
    if (pos === Position.Left) return <ChevronLeft className="w-4 h-4" />;
    if (pos === Position.Top) return <ChevronUp className="w-4 h-4" />;
    if (pos === Position.Bottom) return <ChevronDown className="w-4 h-4" />;
    return <ChevronRight className="w-4 h-4" />;
  };

  const expandBtnStyle = useMemo(() => {
    const pos = data.sourcePos || Position.Right;
    let style = "absolute p-2 bg-white hover:bg-slate-900 text-slate-400 hover:text-white rounded-full transition-all border border-[#dee2e6] hover:border-slate-900 shadow-xl z-20 ";
    
    if (pos === Position.Right) return style + "-right-5 top-1/2 -translate-y-1/2";
    if (pos === Position.Left) return style + "-left-5 top-1/2 -translate-y-1/2";
    if (pos === Position.Top) return style + "-top-5 left-1/2 -translate-x-1/2";
    if (pos === Position.Bottom) return style + "-bottom-5 left-1/2 -translate-x-1/2";
    return style;
  }, [data.sourcePos]);

  const handleToggleCollapse = async (e) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_BASE}/nodes/${original.id}/toggle-collapse`);
      data.onToggleCollapse(original.id);
    } catch (err) {
      console.error("Failed to toggle collapse", err);
    }
  };

  return (
    <div className={`relative px-6 py-4 rounded-xl border-1.5 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-2px] group min-w-[220px] shadow-sm ${getStyles}`}>
      <Handle type="target" position={data.targetPos || Position.Left} className="!bg-slate-400 !border-none !w-1.5 !h-1.5" />
      
      {isRoot ? (
        <>
            <Handle type="source" position={Position.Right} id="source-right" className="!bg-slate-500 !w-1.5 !h-1.5" />
            <Handle type="source" position={Position.Left} id="source-left" className="!bg-slate-500 !w-1.5 !h-1.5" />
            <Handle type="source" position={Position.Top} id="source-top" className="!bg-slate-500 !w-1.5 !h-1.5" />
            <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-slate-500 !w-1.5 !h-1.5" />
        </>
      ) : (
        <Handle type="source" position={data.sourcePos || Position.Right} className="!bg-slate-400 !border-none !w-1.5 !h-1.5" />
      )}

      {/* Dynamic Expand Button */}
      {original.is_expandable && !original.has_expanded && isUnlocked && !isRoot && (
          <button 
              onClick={handleExpand}
              disabled={expanding}
              className={expandBtnStyle}
              title="Click to expand this path"
          >
              {getExpandIcon()}
          </button>
      )}

      {/* Collapse/Show Children Button */}
      {original.has_expanded && (
          <button 
              onClick={handleToggleCollapse}
              className="absolute -top-3 left-1/2 -translate-x-1/2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all border border-slate-700 shadow-lg z-10"
              title={original.is_collapsed ? "Show children" : "Hide children"}
          >
              {original.is_collapsed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
      )}

      <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-lg transition-colors ${
            isCompleted ? "bg-slate-100" : (isUnlocked ? "bg-slate-50" : "bg-transparent")
          }`}>
            <Icon className={`w-4 h-4 ${
              isCompleted ? "text-slate-400" : (isUnlocked ? "text-slate-900" : "text-slate-300")
            }`} />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-[0.15em] mb-1 text-slate-400">
              {isCompleted ? "Learned" : (isUnlocked ? "Path Open" : "Locked")}
            </span>
            <h3 className={`font-bold text-[15px] leading-tight tracking-tight line-clamp-2 max-w-[180px] ${isCompleted ? 'line-through opacity-40' : 'text-black font-[700]'}`}>{label}</h3>
          </div>
      </div>

      {isUnlocked && !isCompleted && (
        <div className="absolute top-2 right-2">
           <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]"></div>
        </div>
      )}
    </div>
  );
});

const nodeTypes = {
  roadmap: RoadmapNode,
};

export default function MapCanvas({ routeId, username, progress, onProgressUpdate }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNodes = useCallback(async () => {
    setLoading(true);
    try {
      const [nodesRes, edgesRes] = await Promise.all([
        axios.get(`${API_BASE}/route-maps/${routeId}/nodes`),
        axios.get(`${API_BASE}/route-maps/${routeId}/edges`)
      ]);
      const rawNodes = nodesRes.data;
      const rawEdges = edgesRes.data;
      
      // Auto-expand Level 2 nodes if they haven't been expanded yet
      // Use a ref or local flag to prevent infinite loops if something goes wrong
      const level2Nodes = rawNodes.filter(n => n.level === 2 && !n.has_expanded);
      if (level2Nodes.length > 0) {
          console.log("DEBUG: Auto-expanding level 2 nodes...", level2Nodes.length);
          Promise.all(level2Nodes.map(n => axios.post(`${API_BASE}/nodes/${n.id}/expand`)))
                 .catch(err => console.error("Auto-expand failed", err));
          // We don't call fetchNodes() recursively here to avoid loops. 
          // The next manual refresh or progress update will show them.
      }

      // Track which nodes are unlocked (root or has completed parent)
      const unlockedIds = new Set();
      const rootNode = rawNodes.find(n => n.level === 1);
      if (rootNode) unlockedIds.add(rootNode.id);
      
      // Determine unlocked status based on NodeLink + progress
      // We iterate a few times to propagate unlock status
      let changed = true;
      while (changed) {
          changed = false;
          rawEdges.forEach(link => {
             // Unlock if parent is unlocked (regardless of completion)
             if (unlockedIds.has(link.parent_id) && !unlockedIds.has(link.child_id)) {
                 unlockedIds.add(link.child_id);
                 changed = true;
             }
          });
      }
      // Distribute Level 2 nodes into 4 directions
      const level2 = rawNodes.filter(n => n.level === 2);
      const nodeInfo = {}; // node_id -> { posX, posY, quadrant }

      const root = rawNodes.find(n => n.level === 1) || rawNodes[0];
      if (root) {
        nodeInfo[root.id] = { posX: root.x ?? 0, posY: root.y ?? 0, quadrant: 'center' };
      }

      const occupied = []; // Array of {x, y} to check for collisions
      const findFreeSpot = (startX, startY, q, level) => {
          const stepX = 400; // Optimal horizontal distance
          const stepY = 220; // Optimal vertical distance
          const safeW = 420; // Collision width
          const safeH = 240; // Collision height
          
          // Directions: 0=R, 1=L, 2=T, 3=B
          let attempts = 0;
          let currentX = startX;
          let currentY = startY;

          // Search strategy: try to stay close to parent but fan out
          while (attempts < 20) {
              const isBlocked = occupied.some(pos => 
                  Math.abs(pos.x - currentX) < safeW && Math.abs(pos.y - currentY) < safeH
              );
              
              if (!isBlocked) return { x: currentX, y: currentY };
              
              attempts++;
              // Shift logic based on quadrant to maintain direction
              if (q === 0 || q === 1) {
                  // Horizontal branches: shift vertically first, then further horizontally
                  const sign = attempts % 2 === 0 ? 1 : -1;
                  currentY = startY + (sign * Math.ceil(attempts/2) * 180);
                  if (attempts > 6) currentX = startX + (q === 0 ? 150 : -150);
              } else {
                  // Vertical branches: shift horizontally first, then further vertically
                  const sign = attempts % 2 === 0 ? 1 : -1;
                  currentX = startX + (sign * Math.ceil(attempts/2) * 350);
                  if (attempts > 6) currentY = startY + (q === 2 ? -100 : 100);
              }
          }
          return { x: currentX, y: currentY };
      };

      // Directions: 0=Right, 1=Left, 2=Top, 3=Bottom
      level2.forEach((n, idx) => {
        const quadrant = idx % 4;
        let px = n.x, py = n.y;
        if (px === null) {
            const preferredX = quadrant === 0 ? 450 : (quadrant === 1 ? -450 : 0);
            const preferredY = quadrant === 2 ? -300 : (quadrant === 3 ? 300 : 0);
            const spot = findFreeSpot(preferredX, preferredY, quadrant, 2);
            px = spot.x; py = spot.y;
        }
        nodeInfo[n.id] = { posX: px, posY: py, quadrant };
        occupied.push({ x: px, y: py });
      });

      // Pass 3: Process Level 3+ based on parents
      const sortedByLevel = [...rawNodes].sort((a, b) => a.level - b.level);
      sortedByLevel.forEach(n => {
        if (nodeInfo[n.id]) return; // Already done (root/level2)

        const parentLink = rawEdges.find(e => e.child_id === n.id);
        const parentId = parentLink?.parent_id;
        const parent = nodeInfo[parentId];
        
        if (parent) {
          let px = n.x, py = n.y;
          const q = parent.quadrant;
          if (px === null) {
            const offsetX = q === 0 ? 450 : (q === 1 ? -450 : 0);
            const offsetY = q === 2 ? -300 : (q === 3 ? 300 : 0);
            const spot = findFreeSpot(parent.posX + offsetX, parent.posY + offsetY, q, n.level);
            px = spot.x; py = spot.y;
          }
          nodeInfo[n.id] = { posX: px, posY: py, quadrant: q };
          occupied.push({ x: px, y: py });
        } else {
            // Fallback for isolated nodes
            const spot = findFreeSpot(n.level * 450, 0, 0, n.level);
            nodeInfo[n.id] = { posX: n.x ?? spot.x, posY: n.y ?? spot.y, quadrant: 0 };
            occupied.push({ x: nodeInfo[n.id].posX, y: nodeInfo[n.id].posY });
        }
      });

      // Tracking hidden status recursively
      const hiddenIds = new Set();
      const checkHidden = (nodeId) => {
          const node = rawNodes.find(n => n.id === nodeId);
          if (!node) return false;
          
          // Find all parents
          const parentLinks = rawEdges.filter(e => e.child_id === nodeId);
          for (const link of parentLinks) {
              const parent = rawNodes.find(p => p.id === link.parent_id);
              if (parent && (parent.is_collapsed || hiddenIds.has(parent.id))) {
                  return true;
              }
          }
          return false;
      };

      // Propagation of hidden status
      let hiddenChanged = true;
      let limit = 0;
      while (hiddenChanged && limit < 10) {
          hiddenChanged = false;
          limit++;
          rawNodes.forEach(n => {
              if (n.level > 1 && !hiddenIds.has(n.id)) {
                  if (checkHidden(n.id)) {
                      hiddenIds.add(n.id);
                      hiddenChanged = true;
                  }
              }
          });
      }

      const rfNodes = rawNodes.map(n => {
        const info = nodeInfo[n.id] || { posX: 0, posY: 0, quadrant: 0 };
        const isCompleted = progress[n.id];
        const isUnlocked = unlockedIds.has(n.id) || n.level === 1;
        
        // Auto-collapse logic: if parent and all children are done
        // This is a UI-level suggestion that could be moved to backend if needed
        // For now we trust the stored is_collapsed but allow overriding
        
        const isHidden = hiddenIds.has(n.id);

        // Port logic based on quadrant
        let targetPos = Position.Left;
        let sourcePos = Position.Right;
        if (info.quadrant === 1) { targetPos = Position.Right; sourcePos = Position.Left; }
        if (info.quadrant === 2) { targetPos = Position.Bottom; sourcePos = Position.Top; }
        if (info.quadrant === 3) { targetPos = Position.Top; sourcePos = Position.Bottom; }

        return {
          id: n.id.toString(),
          type: 'roadmap',
          position: { x: info.posX, y: info.posY },
          data: { 
            label: n.title, 
            original: n, 
            isUnlocked, 
            isCompleted,
            targetPos,
            sourcePos,
            onExpand: async (id) => {
              await axios.post(`${API_BASE}/nodes/${id}/expand`);
              fetchNodes();
            },
            onToggleCollapse: () => {
              fetchNodes();
            }
          },
          hidden: isHidden
        };
      });

      const rfEdges = rawEdges.map(link => {
          const isParentDone = progress[link.parent_id];
          const isChildDone = progress[link.child_id];
          const parent = rawNodes.find(n => n.id === link.parent_id);
          const childInfo = nodeInfo[link.child_id];

          let sourceHandle = null;
          if (parent?.level === 1 && childInfo) {
              if (childInfo.quadrant === 0) sourceHandle = "source-right";
              else if (childInfo.quadrant === 1) sourceHandle = "source-left";
              else if (childInfo.quadrant === 2) sourceHandle = "source-top";
              else if (childInfo.quadrant === 3) sourceHandle = "source-bottom";
          }

          const getLevelColor = (level) => {
              const palette = [
                  '#ff4d4d', // Red
                  '#ff8533', // Red-Orange
                  '#ffcc00', // Orange/Yellow
                  '#20c997', // Teal
                  '#3399ff', // Blue
                  '#845ef7', // Purple
                  '#f06595'  // Pink
              ];
              return palette[(level - 1) % palette.length];
          };

          const baseColor = getLevelColor(parent?.level || 1);
          const isDashed = !isChildDone;
          const edgeColor = isDashed ? `${baseColor}66` : baseColor;
          const isHidden = hiddenIds.has(link.child_id) || hiddenIds.has(link.parent_id);

          return {
            id: `e-${link.parent_id}-${link.child_id}`,
            source: link.parent_id.toString(),
            target: link.child_id.toString(),
            sourceHandle, 
            animated: isChildDone && !isParentDone, // Subtle animation for newly unlocked
            style: { 
                stroke: edgeColor, 
                strokeWidth: isChildDone ? 3 : 2,
                strokeDasharray: isChildDone ? '0' : '8 4'
            },
            markerEnd: { 
                type: MarkerType.ArrowClosed, 
                color: edgeColor
            },
            hidden: isHidden
          };
      });

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

  const onNodeDragStop = useCallback(async (event, node) => {
    const { id, position } = node;
    try {
      await axios.post(`${API_BASE}/nodes/${id}/position`, null, {
        params: { x: position.x, y: position.y }
      });
    } catch (err) {
      console.error("Failed to save node position", err);
    }
  }, []);

  const onNodeClick = (event, node) => {
    setSelectedNode(node.data.original);
  };

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onlyRenderVisibleElements={true}
        fitView
      >
        <Background color="#dedcd3" gap={32} variant="dots" />
        <Controls className="!bg-white !border-[#dee2e6] !shadow-lg !rounded-xl overflow-hidden" />
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
