# AI Agent Trajectory Viewer

A web-based viewer for AI agent trajectories created with the OpenAI Agents SDK. This tool allows you to visualize and explore the execution flow of AI agents, including their interactions, handoffs, and function calls.

## Features

- **Flow Visualization**: See the flow of execution between agents, generations, and function calls in a graph view
- **Timeline View**: View all spans in chronological order
- **Detailed Inspection**: Examine the details of each span, including inputs, outputs, and metadata
- **File Upload**: Upload and analyze your own trajectory files
- **Demo Data**: Try the viewer with included demo data

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/traj-viewer.git
   cd traj-viewer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Upload a `.traj` file using the "Upload .traj File" button
2. Or click "Load Demo Data" to load the included example
3. Explore the agent trajectory:
   - Use the "Flow" tab to see the execution graph
   - Click on any node to view its details in the "Details" tab
   - Use the "Timeline" tab to see all spans in chronological order

## Trajectory File Format

The viewer expects trajectory files in the format produced by the OpenAI Agents SDK. Each line in the file should be a valid JSON object with a `data` array containing trace and span objects.

## License

MIT

## Acknowledgments

- Inspired by the OpenAI Agent Trace Viewer
- Built with React, Material-UI, and React Flow 