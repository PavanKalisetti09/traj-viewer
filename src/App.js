import React, { useState } from 'react';
import { Typography, Button, Box, Container, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TraceViewer from './components/TraceViewer';
import { parseTraceFile } from './utils/traceParser';

function App() {
  const [trace, setTrace] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedTrace = parseTraceFile(e.target.result);
        setTrace(parsedTrace);
      } catch (error) {
        console.error('Error parsing trace file:', error);
        alert('Error parsing trace file. Please make sure it is a valid .traj file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDemoData = () => {
    // Load the test-trace.traj file that's in the public folder
    fetch('/test-trace.traj')
      .then(response => response.text())
      .then(data => {
        try {
          const parsedTrace = parseTraceFile(data);
          setTrace(parsedTrace);
          setFileName('test-trace.traj');
        } catch (error) {
          console.error('Error parsing demo trace file:', error);
          alert('Error parsing demo trace file.');
        }
      })
      .catch(error => {
        console.error('Error fetching demo trace file:', error);
        alert('Error fetching demo trace file.');
      });
  };

  return (
    <Container className="app-container">
      <Box className="header">
        <Typography variant="h4" component="h1">
          AI Agent Trajectory Viewer
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box className="file-input-container">
          <Typography variant="h6" gutterBottom>
            Upload Trajectory File
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Upload .traj File
              <input
                type="file"
                accept=".traj,.json"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            <Button variant="outlined" onClick={handleDemoData}>
              Load Demo Data
            </Button>
            {fileName && (
              <Typography variant="body2" color="textSecondary">
                {fileName}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {trace ? (
        <TraceViewer trace={trace} />
      ) : (
        <Paper elevation={2} sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Upload a trajectory file to view the trace
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default App; 