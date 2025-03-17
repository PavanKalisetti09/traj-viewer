import React from 'react';
import { Box, Typography, Divider, Chip, Paper } from '@mui/material';
import ReactJson from '@microlink/react-json-view';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getSpanType, formatTimestamp, calculateDuration } from '../utils/traceParser';

const SpanDetails = ({ span }) => {
  if (!span) return null;

  const spanType = getSpanType(span);
  const duration = calculateDuration(span.started_at, span.ended_at);

  return (
    <Box className="span-details">
      <Box className="span-details-header">
        <Typography variant="h5" gutterBottom>
          {spanType === 'agent' ? span.span_data.name : spanType}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Type: ${spanType}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Duration: ${duration}`} 
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            label={`Started: ${formatTimestamp(span.started_at)}`} 
            variant="outlined" 
          />
          <Chip 
            label={`Ended: ${formatTimestamp(span.ended_at)}`} 
            variant="outlined" 
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Span ID: {span.id}
        </Typography>
        
        {span.parent_id && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Parent ID: {span.parent_id}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Render different content based on span type */}
      {spanType === 'generation' && renderGenerationContent(span)}
      {spanType === 'function' && renderFunctionContent(span)}
      {spanType === 'handoff' && renderHandoffContent(span)}
      {spanType === 'agent' && renderAgentContent(span)}

      <Divider sx={{ my: 2 }} />

      {/* Raw JSON view */}
      <Typography variant="h6" gutterBottom>Raw Span Data</Typography>
      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <ReactJson 
          src={span} 
          name={null} 
          collapsed={2} 
          displayDataTypes={false} 
          enableClipboard={false}
          style={{ fontSize: '12px' }}
        />
      </Paper>
    </Box>
  );
};

// Render content for generation spans
const renderGenerationContent = (span) => {
  const { input, output, model, usage } = span.span_data;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Generation</Typography>
      
      {model && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Model</Typography>
          <Chip label={model} color="primary" size="small" />
        </Box>
      )}
      
      {usage && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Usage</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {usage.input_tokens && (
              <Chip label={`Input: ${usage.input_tokens} tokens`} size="small" />
            )}
            {usage.output_tokens && (
              <Chip label={`Output: ${usage.output_tokens} tokens`} size="small" />
            )}
          </Box>
        </Box>
      )}
      
      {input && input.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Input</Typography>
          {input.map((msg, index) => renderMessage(msg, index))}
        </Box>
      )}
      
      {output && output.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>Output</Typography>
          {output.map((msg, index) => renderMessage(msg, index))}
        </Box>
      )}
    </Box>
  );
};

// Render content for function spans
const renderFunctionContent = (span) => {
  const { name, input, output } = span.span_data;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Function: {name}</Typography>
      
      {input && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Input</Typography>
          <SyntaxHighlighter language="json" style={tomorrow}>
            {typeof input === 'string' ? input : JSON.stringify(input, null, 2)}
          </SyntaxHighlighter>
        </Box>
      )}
      
      {output && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>Output</Typography>
          <SyntaxHighlighter language="json" style={tomorrow}>
            {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
          </SyntaxHighlighter>
        </Box>
      )}
    </Box>
  );
};

// Render content for handoff spans
const renderHandoffContent = (span) => {
  const { from_agent, to_agent } = span.span_data;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Handoff</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip label={from_agent} color="primary" />
        <Typography variant="body1">→</Typography>
        <Chip label={to_agent} color="secondary" />
      </Box>
    </Box>
  );
};

// Render content for agent spans
const renderAgentContent = (span) => {
  const { name, handoffs, tools, output_type } = span.span_data;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Agent: {name}</Typography>
      
      {handoffs && handoffs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Handoffs</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {handoffs.map((handoff, index) => (
              <Chip key={index} label={handoff} color="primary" size="small" />
            ))}
          </Box>
        </Box>
      )}
      
      {tools && tools.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Tools</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tools.map((tool, index) => (
              <Chip key={index} label={tool} color="secondary" size="small" />
            ))}
          </Box>
        </Box>
      )}
      
      {output_type && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>Output Type</Typography>
          <Chip label={output_type} size="small" />
        </Box>
      )}
    </Box>
  );
};

// Helper function to render a message
const renderMessage = (msg, index) => {
  if (!msg) return null;

  return (
    <Box key={index} className={`message-container ${msg.role}-message`}>
      <Typography variant="body2" className="message-role">
        {msg.role}
      </Typography>
      
      {msg.content && (
        <Typography variant="body2" className="message-content">
          {msg.content}
        </Typography>
      )}
      
      {msg.tool_calls && msg.tool_calls.length > 0 && (
        <Box className="tool-call">
          <Typography variant="body2" className="tool-call-header">
            Tool Calls:
          </Typography>
          {msg.tool_calls.map((toolCall, idx) => (
            <Box key={idx} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {toolCall.function?.name || toolCall.type}
              </Typography>
              {toolCall.function?.arguments && (
                <SyntaxHighlighter language="json" style={tomorrow} customStyle={{ fontSize: '12px' }}>
                  {toolCall.function.arguments}
                </SyntaxHighlighter>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SpanDetails; 