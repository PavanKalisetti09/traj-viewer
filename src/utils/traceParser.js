/**
 * Parse a trajectory file into a structured format for the viewer
 * @param {string} fileContent - The content of the trajectory file
 * @returns {Object} The parsed trace data
 */
export const parseTraceFile = (fileContent) => {
  try {
    // Split the file content by lines and parse each line as JSON
    const lines = fileContent.trim().split('\n');
    const jsonObjects = lines.map(line => JSON.parse(line));
    
    // Flatten the data arrays from each JSON object
    const allData = jsonObjects.flatMap(obj => obj.data || []);
    
    // Extract the trace object and spans
    const traceObj = allData.find(item => item.object === 'trace');
    const spans = allData.filter(item => item.object === 'trace.span');
    
    // Create a map of spans by ID for easy lookup
    const spansById = {};
    spans.forEach(span => {
      spansById[span.id] = span;
    });
    
    // Build the trace tree structure
    const rootSpans = spans.filter(span => !span.parent_id);
    const traceTree = rootSpans.map(span => buildSpanTree(span, spansById));
    
    return {
      trace: traceObj,
      spans,
      spansById,
      traceTree
    };
  } catch (error) {
    console.error('Error parsing trace file:', error);
    throw new Error('Failed to parse trace file');
  }
};

/**
 * Recursively build a tree structure from spans
 * @param {Object} span - The current span
 * @param {Object} spansById - Map of spans by ID
 * @returns {Object} The span tree
 */
const buildSpanTree = (span, spansById) => {
  const children = Object.values(spansById)
    .filter(s => s.parent_id === span.id)
    .map(childSpan => buildSpanTree(childSpan, spansById));
  
  return {
    ...span,
    children
  };
};

/**
 * Get the type of a span based on its data
 * @param {Object} span - The span object
 * @returns {string} The span type
 */
export const getSpanType = (span) => {
  if (!span || !span.span_data) return 'unknown';
  return span.span_data.type || 'unknown';
};

/**
 * Format a timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (error) {
    return timestamp;
  }
};

/**
 * Calculate the duration between two timestamps
 * @param {string} startTime - Start timestamp
 * @param {string} endTime - End timestamp
 * @returns {string} Formatted duration
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = ((durationMs % 60000) / 1000).toFixed(2);
      return `${minutes}m ${seconds}s`;
    }
  } catch (error) {
    return '';
  }
}; 