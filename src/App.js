import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import SpriteText from 'three-spritetext';

function App() {
  useEffect(() => {
    import('3d-force-graph').then(ForceGraph3D => {
      const apiUrl = process.env.REACT_APP_DATA_API || './data/custom.json';
      const Graph = ForceGraph3D.default()
        (document.getElementById('3d-graph'))
        .jsonUrl(apiUrl)
        .nodeAutoColorBy('group')
        .nodeThreeObject(node => {
          const sprite = new SpriteText(node.id);
          sprite.material.depthWrite = false;
          sprite.color = node.color;
          sprite.textHeight = 8;
          return sprite;
        });

      Graph.d3Force('charge').strength(-120);
      console.log("API URL:", process.env.REACT_APP_DATA_API);

      // Create container for search inputs
      const searchContainer = document.createElement('div');
      searchContainer.style.position = 'absolute';
      searchContainer.style.top = '20px';
      searchContainer.style.left = '50%';
      searchContainer.style.transform = 'translateX(-50%)';
      searchContainer.style.zIndex = '1';
      searchContainer.style.display = 'flex';
      searchContainer.style.flexDirection = 'row';
      searchContainer.style.gap = '10px';
      searchContainer.style.alignItems = 'center';

      // Create keyword search input and suggestions container
      const keywordContainer = document.createElement('div');
      keywordContainer.style.position = 'relative';

      const keywordInput = document.createElement('input');
      keywordInput.style.padding = '5px';
      keywordInput.style.width = '300px';
      keywordInput.style.fontSize = '14px';
      keywordInput.placeholder = 'Search keywords...';
      keywordInput.style.marginRight = '20px';

      // Create suggestions popup
      const suggestionsBox = document.createElement('div');
      suggestionsBox.style.position = 'absolute';
      suggestionsBox.style.top = '40px';
      suggestionsBox.style.left = '0';
      suggestionsBox.style.width = '300px';
      suggestionsBox.style.maxHeight = '400px';
      suggestionsBox.style.overflowY = 'auto';
      suggestionsBox.style.background = 'white';
      suggestionsBox.style.border = '1px solid #ddd';
      suggestionsBox.style.borderRadius = '4px';
      suggestionsBox.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      suggestionsBox.style.display = 'none';
      suggestionsBox.style.zIndex = '1000';
      suggestionsBox.style.fontSize = '14px';
      suggestionsBox.style.lineHeight = '1.4';

      // Add suggestion fetching logic
      let suggestionTimeout;
      keywordInput.addEventListener('input', () => {
        clearTimeout(suggestionTimeout);
        suggestionTimeout = setTimeout(() => {
          const keyword = keywordInput.value.trim();
          if (keyword.length > 0) {
            fetch(`${apiUrl}?suggest=${encodeURIComponent(keyword)}`)
              .then(response => response.json())
              .then(suggestions => {
                suggestionsBox.innerHTML = '';
                if (suggestions.length > 0) {
                  suggestions.forEach(suggestion => {
                    const suggestionItem = document.createElement('div');
                    // Extract value from the suggestion object
                    const value = suggestion.value.split('@')[0]; // Remove language tag if present
                    suggestionItem.textContent = value;
                    suggestionItem.style.padding = '8px';
                    suggestionItem.style.cursor = 'pointer';
                    suggestionItem.style.hover = '#f0f0f0';
                    
                    // Add hover effect
                    suggestionItem.addEventListener('mouseover', () => {
                      suggestionItem.style.backgroundColor = '#f0f0f0';
                    });
                    suggestionItem.addEventListener('mouseout', () => {
                      suggestionItem.style.backgroundColor = 'white';
                    });
                    
                    // Handle suggestion click
                    suggestionItem.addEventListener('click', () => {
                      keywordInput.value = value;
                      suggestionsBox.style.display = 'none';
                      
                      // Modified handleSearch to include keyword as 'q' parameter
                      const keyword = value;
                      const subject = subjectInput.value;
                      const predicate = predicateInput.value;
                      const object = objectInput.value;
                      
                      const params = new URLSearchParams(new URL(apiUrl).search);
                      if (keyword) {
                        params.append('q', keyword);       // For filtering
                      }
                      if (subject) params.append('subject', subject);
                      if (predicate) params.append('predicate', predicate);
                      if (object) params.append('object', object);
                      
                      const searchUrl = `${apiUrl.split('?')[0]}?${params.toString()}`;
                      
                      fetch(searchUrl)
                        .then(response => response.json())
                        .then(data => {
                          // Update the graph with new data
                          Graph
                            .graphData(data)
                            .nodeColor(node => node.color)
                            .linkWidth(1)
                            .linkDirectionalParticles(2)
                            .linkDirectionalParticleWidth(2)
                            .nodeLabel(node => node.label || node.id)
                            .onNodeClick(node => {
                              // Your existing node click handler if any
                            });
                        })
                        .catch(error => console.error('Error:', error));
                    });
                    
                    suggestionsBox.appendChild(suggestionItem);
                  });
                  suggestionsBox.style.display = 'block';
                } else {
                  suggestionsBox.style.display = 'none';
                }
              })
              .catch(error => {
                console.error('Error fetching suggestions:', error);
                suggestionsBox.style.display = 'none';
              });
          } else {
            suggestionsBox.style.display = 'none';
          }
        }, 300); // Debounce delay for suggestions
      });

      // Close suggestions when clicking outside
      document.addEventListener('click', (e) => {
        if (!keywordContainer.contains(e.target)) {
          suggestionsBox.style.display = 'none';
        }
      });

      // Append elements
      keywordContainer.appendChild(keywordInput);
      keywordContainer.appendChild(suggestionsBox);
      searchContainer.appendChild(keywordContainer);

      // Create container for advanced search inputs
      const advancedContainer = document.createElement('div');
      advancedContainer.style.display = 'none'; // Hidden by default
      
      // Create Advanced toggle button
      const advancedButton = document.createElement('button');
      advancedButton.textContent = 'Advanced';
      advancedButton.style.padding = '5px 10px';
      advancedButton.style.marginRight = '20px';
      advancedButton.style.cursor = 'pointer';
      advancedButton.style.backgroundColor = '#f0f0f0';
      advancedButton.style.border = '1px solid #ddd';
      advancedButton.style.borderRadius = '4px';

      // Create subject search input
      const subjectInput = document.createElement('input');
      subjectInput.style.padding = '5px';
      subjectInput.style.width = '150px';
      subjectInput.placeholder = 'Search subjects...';

      // Create predicate search input
      const predicateInput = document.createElement('input');
      predicateInput.style.padding = '5px';
      predicateInput.style.width = '150px';
      predicateInput.placeholder = 'Search predicates...';

      // Create object search input
      const objectInput = document.createElement('input');
      objectInput.style.padding = '5px';
      objectInput.style.width = '150px';
      objectInput.placeholder = 'Search objects...';

      // Add toggle functionality
      advancedButton.addEventListener('click', () => {
        const isHidden = advancedContainer.style.display === 'none';
        advancedContainer.style.display = isHidden ? 'flex' : 'none';
        advancedButton.style.backgroundColor = isHidden ? '#e0e0e0' : '#f0f0f0';
      });

      // Add inputs to advanced container
      advancedContainer.style.gap = '10px';
      advancedContainer.appendChild(subjectInput);
      advancedContainer.appendChild(predicateInput);
      advancedContainer.appendChild(objectInput);

      // Add elements to search container in correct order
      searchContainer.appendChild(keywordContainer);
      searchContainer.appendChild(advancedButton);
      searchContainer.appendChild(advancedContainer);

      // Add container to document
      document.body.appendChild(searchContainer);

      // Cleanup on unmount
      return () => {
        document.body.removeChild(searchContainer);
      };
    });
  }, []);

  return (
    <div className="App">

      <div id="3d-graph"></div>
    </div>
  );
}

export default App;
