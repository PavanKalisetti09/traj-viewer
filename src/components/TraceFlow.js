import React, { useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Box } from '@mui/material';
import { getSpanType, calculateDuration } from '../utils/traceParser';

// Node width and height
const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

const TraceFlow = ({ trace, onSpanClick, selectedSpanId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!trace || !trace.spans || trace.spans.length === 0) return;

    // Create nodes and edges from the trace data
    const { nodes: layoutedNodes, edges: layoutedEdges } = createNodesAndEdges(
      trace.spans,
      trace.spansById,
      onSpanClick,
      selectedSpanId
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [trace, onSpanClick, selectedSpanId, setNodes, setEdges]);

  return (
    <Box className="flow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </Box>
  );
};

// Create nodes and edges from the trace data
const createNodesAndEdges = (spans, spansById, onSpanClick, selectedSpanId) => {
  const nodes = [];
  const edges = [];
  const dagreGraph = new dagre.graphlib.Graph();
  
  // Set the graph direction
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Create nodes
  spans.forEach(span => {
    const type = getSpanType(span);
    const nodeData = {
      id: span.id,
      data: {
        label: (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {type === 'agent' ? span.span_data.name : type}
            </div>
            <div style={{ fontSize: '10px' }}>
              {calculateDuration(span.started_at, span.ended_at)}
            </div>
          </div>
        ),
        span,
        onClick: () => onSpanClick(span.id)
      },
      position: { x: 0, y: 0 },
      className: `span-node ${type}-node`,
      style: {
        background: getNodeColor(type),
        border: selectedSpanId === span.id ? '3px solid #000' : 'none',
        width: NODE_WIDTH,
        borderRadius: '5px',
        padding: '10px',
        color: 'white'
      }
    };
    
    nodes.push(nodeData);
    
    // Add node to the dagre graph for layout calculation
    dagreGraph.setNode(span.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Create edges
  spans.forEach(span => {
    if (span.parent_id) {
      edges.push({
        id: `${span.parent_id}-${span.id}`,
        source: span.parent_id,
        target: span.id,
        animated: getSpanType(span) === 'handoff',
        style: { stroke: '#999' }
      });
      
      // Add edge to the dagre graph for layout calculation
      dagreGraph.setEdge(span.parent_id, span.id);
    }
  });

  // Calculate the layout
  dagre.layout(dagreGraph);

  // Apply the layout to the nodes
  nodes.forEach(node => {
    const dagreNode = dagreGraph.node(node.id);
    node.position = {
      x: dagreNode.x - NODE_WIDTH / 2,
      y: dagreNode.y - NODE_HEIGHT / 2
    };
  });

  return { nodes, edges };
};

// Helper function to get node color based on span type
const getNodeColor = (type) => {
  switch (type) {
    case 'agent':
      return '#3498db';
    case 'generation':
      return '#2ecc71';
    case 'function':
      return '#e74c3c';
    case 'handoff':
      return '#9b59b6';
    default:
      return '#95a5a6';
  }
};

export default TraceFlow; 