import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import TraceFlow from './TraceFlow';
import SpanDetails from './SpanDetails';
import { getSpanType, formatTimestamp } from '../utils/traceParser';

const TraceViewer = ({ trace }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSpanId, setSelectedSpanId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSpanClick = (spanId) => {
    setSelectedSpanId(spanId);
    setSelectedTab(1); // Switch to the Details tab
  };

  // Get the selected span
  const selectedSpan = selectedSpanId ? trace.spansById[selectedSpanId] : null;

  return (
    <Paper elevation={2} className="trace-container">
      <Box className="trace-header" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5">
          {trace.trace?.workflow_name || 'Agent Trace'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Trace ID: {trace.trace?.id || 'Unknown'}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Flow" />
          <Tab label="Details" disabled={!selectedSpan} />
          <Tab label="Timeline" />
        </Tabs>
      </Box>

      <Box className="trace-content">
        {selectedTab === 0 && (
          <TraceFlow 
            trace={trace} 
            onSpanClick={handleSpanClick} 
            selectedSpanId={selectedSpanId}
          />
        )}
        
        {selectedTab === 1 && selectedSpan && (
          <SpanDetails span={selectedSpan} />
        )}
        
        {selectedTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Timeline</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {trace.spans.sort((a, b) => {
                return new Date(a.started_at) - new Date(b.started_at);
              }).map(span => (
                <Paper 
                  key={span.id} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    borderLeft: '4px solid',
                    borderLeftColor: getSpanColor(getSpanType(span)),
                    bgcolor: selectedSpanId === span.id ? 'rgba(0, 0, 0, 0.05)' : 'white'
                  }}
                  onClick={() => handleSpanClick(span.id)}
                >
                  <Typography variant="subtitle1">
                    {span.span_data?.name || getSpanType(span)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatTimestamp(span.started_at)} - {formatTimestamp(span.ended_at)}
                  </Typography>
                  <Typography variant="body2">
                    {span.span_data?.type === 'agent' ? 'Agent: ' + span.span_data?.name : ''}
                    {span.span_data?.type === 'handoff' ? 
                      `Handoff: ${span.span_data?.from_agent} → ${span.span_data?.to_agent}` : ''}
                    {span.span_data?.type === 'function' ? 'Function: ' + span.span_data?.name : ''}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Helper function to get color based on span type
const getSpanColor = (type) => {
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

export default TraceViewer; 