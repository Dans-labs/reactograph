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
      keywordInput.style.width = '150px';
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
                      handleSearch(); // Trigger search with selected suggestion
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

      // Add event listeners for real-time filtering
      const handleSearch = () => {
        const keyword = keywordInput.value;
        const subject = subjectInput.value;
        const predicate = predicateInput.value;
        const object = objectInput.value;
        
        // Construct query parameters
        const params = new URLSearchParams(new URL(apiUrl).search);
        if (keyword) params.append('suggest', keyword);
        if (subject) params.append('subject', subject);
        if (predicate) params.append('predicate', predicate);
        if (object) params.append('object', object);
        
        // Append search parameters to existing apiUrl
        const searchUrl = `${apiUrl.split('?')[0]}?${params.toString()}`;
        
        fetch(searchUrl)
          .then(response => response.json())
          .then(data => {
            // Update your graph with the new data
            // Implement your graph update logic here
          })
          .catch(error => console.error('Error:', error));
      };

      // Add input event listeners with debounce
      let debounceTimeout;
      const debounceDelay = 300; // milliseconds

      [keywordInput, subjectInput, predicateInput, objectInput].forEach(input => {
        input.addEventListener('input', () => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(handleSearch, debounceDelay);
        });
      });

      // Append all elements to the container
      searchContainer.appendChild(keywordInput);
      searchContainer.appendChild(subjectInput);
      searchContainer.appendChild(predicateInput);
      searchContainer.appendChild(objectInput);
      
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
