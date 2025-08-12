const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Basic MCP endpoints for file operations
app.post('/search_for_pattern', (req, res) => {
  const { pattern, directory = '/workspaces/projects/coding_test_platform' } = req.body;
  // Simple pattern search implementation
  try {
    const results = searchForPattern(pattern, directory);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/find_symbol', (req, res) => {
  const { symbol, directory = '/workspaces/projects/coding_test_platform' } = req.body;
  try {
    const results = findSymbol(symbol, directory);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/read_file', (req, res) => {
  const { filepath } = req.body;
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/list_dir', (req, res) => {
  const { directory } = req.body;
  try {
    const files = fs.readdirSync(directory);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple pattern search function
function searchForPattern(pattern, directory) {
  const results = [];
  
  function searchInDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && !file.includes('node_modules')) {
        searchInDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx'))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(pattern)) {
            results.push(filePath);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }
  
  searchInDirectory(directory);
  return results;
}

// Simple symbol finder function
function findSymbol(symbol, directory) {
  const results = [];
  const symbolRegex = new RegExp(`(function|class|const|let|var|interface|type)\\s+${symbol}\\b`, 'g');
  
  function searchInDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && !file.includes('node_modules')) {
        searchInDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx'))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (symbolRegex.test(content)) {
            results.push(filePath);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }
  
  searchInDirectory(directory);
  return results;
}

app.listen(port, () => {
  console.log(`Serena MCP Server running on port ${port}`);
});

// Keep the container running
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, gracefully shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, gracefully shutting down');
  process.exit(0);
});