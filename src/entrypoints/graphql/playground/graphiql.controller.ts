import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('graphiql')
export class GraphiQLController {
  @Get()
  serveGraphiQL(@Res() res: Response): void {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GraphiQL - GraphQL Playground</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f6f8fa;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: #2d3748;
            color: white;
            padding: 1rem;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
        }

        .header p {
            margin: 0;
            opacity: 0.8;
        }

        .container {
            display: flex;
            flex: 1;
            gap: 1rem;
            padding: 1rem;
            min-height: 0;
        }

        .panel {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        .query-panel {
            flex: 1;
        }

        .result-panel {
            flex: 1;
        }

        .panel-header {
            background: #f8fafc;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .panel-content {
            flex: 1;
            padding: 1rem;
            overflow: auto;
        }

        textarea {
            width: 100%;
            height: 300px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 0.75rem;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            resize: vertical;
            background: #f8fafc;
            line-height: 1.4;
        }

        textarea:focus {
            outline: none;
            border-color: #4299e1;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .execute-btn {
            background: #4299e1;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s;
        }

        .execute-btn:hover {
            background: #3182ce;
        }

        .execute-btn:disabled {
            background: #a0aec0;
            cursor: not-allowed;
        }

        .result-area {
            min-height: 300px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 0.75rem;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            white-space: pre-wrap;
            overflow: auto;
            line-height: 1.4;
        }

        .examples {
            margin-top: 1rem;
            padding: 1rem;
            background: #edf2f7;
            border-radius: 4px;
        }

        .example-btn {
            background: #e2e8f0;
            border: none;
            padding: 0.25rem 0.5rem;
            margin: 0.25rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        }

        .example-btn:hover {
            background: #cbd5e0;
        }

        .error {
            color: #e53e3e;
            background: #fed7d7;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            border: 1px solid #feb2b2;
        }

        .success {
            color: #38a169;
            background: #c6f6d5;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            border: 1px solid #9ae6b4;
        }

        @media (max-width: 768px) {
            .container {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            textarea {
                height: 200px;
            }
            
            .result-area {
                min-height: 200px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>GraphiQL - GraphQL Playground</h1>
        <p>Test your GraphQL queries and mutations</p>
    </div>
    
    <div class="container">
        <div class="panel query-panel">
            <div class="panel-header">
                Query Editor
                <button class="execute-btn" onclick="executeQuery()" id="executeBtn">
                    Execute Query
                </button>
            </div>
            <div class="panel-content">
                <textarea id="queryInput" placeholder="Enter your GraphQL query here...">
# Welcome to GraphiQL!
# Try these example queries:

# 1. Create a player
mutation CreatePlayer {
  createPlayer(input: { name: "John Doe" }) {
    id
    name
    teamId
    createdAt
  }
}

# 2. Get a player (replace with actual ID)
# query GetPlayer {
#   player(id: "your-player-id-here") {
#     id
#     name
#     teamId
#     createdAt
#     updatedAt
#   }
# }

# 3. Delete a player (replace with actual ID)  
# mutation DeletePlayer {
#   deletePlayer(id: "your-player-id-here")
# }
                </textarea>
                
                <div class="examples">
                    <strong>Quick Examples:</strong><br>
                    <button class="example-btn" onclick="loadExample('schema')">Schema Info</button>
                    <button class="example-btn" onclick="loadExample('create')">Create Player</button>
                    <button class="example-btn" onclick="loadExample('query')">Query Player</button>
                    <button class="example-btn" onclick="loadExample('delete')">Delete Player</button>
                </div>
            </div>
        </div>
        
        <div class="panel result-panel">
            <div class="panel-header">
                Result
            </div>
            <div class="panel-content">
                <div id="result" class="result-area">
Click "Execute Query" to see results here...

Tip: Use Ctrl+Enter to execute queries quickly!
                </div>
            </div>
        </div>
    </div>

    <script>
        const EXAMPLE_QUERIES = {
          schema: \`
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
    }
  }
}\`,

          create: \`
mutation CreatePlayer {
  createPlayer(input: { 
    name: "Žydrūnas Ilgauskas", 
    teamId: "zalgiris-kaunas" 
  }) {
    id
    name
    teamId
    createdAt
  }
}\`,

          query: \`
query GetPlayers {
  players {
    id
    name
    teamId
    createdAt
    updatedAt
  }
}\`,

          delete: \`
mutation DeletePlayer {
  deletePlayer(id: "replace-with-actual-id")
}\`,
        };

        async function executeQuery() {
          const queryInput = document.getElementById('queryInput');
          const resultDiv = document.getElementById('result');
          const executeBtn = document.getElementById('executeBtn');

          const query = queryInput.value.trim();
          if (!query) {
            showError('Please enter a GraphQL query');
            return;
          }

          const cleanQuery = query
            .split('\\n')
            .filter((line) => !line.trim().startsWith('#') && line.trim())
            .join('\\n');

          if (!cleanQuery) {
            showError('Please enter a valid GraphQL query (not just comments)');
            return;
          }

          executeBtn.disabled = true;
          executeBtn.textContent = 'Executing...';
          resultDiv.textContent = 'Executing query...';

          try {
            const response = await fetch('/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({ query: cleanQuery }),
            });

            const result = await response.json();

            if (response.ok) {
              if (result.errors) {
                showError('GraphQL Errors:\\n' + JSON.stringify(result.errors, null, 2));
              } else {
                showSuccess(JSON.stringify(result, null, 2));
              }
            } else {
              showError(\`HTTP \${response.status}: \${response.statusText}\\n\${JSON.stringify(result, null, 2)}\`);
            }
          } catch (error) {
            showError(\`Network Error: \${error.message}\`);
          } finally {
            executeBtn.disabled = false;
            executeBtn.textContent = 'Execute Query';
          }
        }

        function loadExample(type) {
          const queryInput = document.getElementById('queryInput');
          const exampleQuery = EXAMPLE_QUERIES[type];

          if (exampleQuery) {
            queryInput.value = exampleQuery.trim();
            queryInput.focus();
          }
        }

        function showError(message) {
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = \`<div class="error">\${escapeHtml(message)}</div>\`;
        }

        function showSuccess(message) {
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = \`<div class="success">Success!</div><pre>\${escapeHtml(message)}</pre>\`;
        }

        function escapeHtml(text) {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        function handleKeyDown(event) {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            executeQuery();
          }
        }

        document.addEventListener('DOMContentLoaded', function () {
          document.addEventListener('keydown', handleKeyDown);

          const queryInput = document.getElementById('queryInput');
          if (queryInput) {
            queryInput.focus();
            queryInput.setSelectionRange(queryInput.value.length, queryInput.value.length);
          }

          console.log('GraphiQL Playground initialized');
          console.log('Keyboard shortcuts:');
          console.log('  Ctrl+Enter / Cmd+Enter: Execute query');
        });

        window.executeQuery = executeQuery;
        window.loadExample = loadExample;
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
