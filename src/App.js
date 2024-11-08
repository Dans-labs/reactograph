import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

function App() {
  useEffect(() => {
    // Update document title
    document.title = 'ReactoGraph for Linked Data';
  }, []); // Empty dependency array means this runs once on mount

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
        })
        .onNodeClick(node => {
          const host = process.env.REACT_APP_HOST || 'https://dataverse.harvard.edu';
          const keywordValue = keywordInput.value ? `+${encodeURIComponent(keywordInput.value)}` : '';
          node.clickurl = `${host}/dataverse/harvard?q=${encodeURIComponent(node.id)}${keywordValue}`;
          
          if (node.clickurl) {
            // Open URL in new tab
            window.open(node.clickurl, '_blank', 'noopener,noreferrer');
          }
        });

      // Create keyword input
      const keywordInput = document.createElement('input');
      keywordInput.style.padding = '5px';
      keywordInput.style.width = '300px';
      keywordInput.style.fontSize = '14px';
      keywordInput.placeholder = 'Search keywords...';
      keywordInput.style.marginRight = '20px';

      // Set default value for the keyword input from environment variable
      const defaultTerm = process.env.REACT_APP_DEFAULT_TERM || 'africa';
      keywordInput.value = defaultTerm; // Set default term from env variable

      // Append the keyword input to the document (or wherever appropriate)
      document.body.appendChild(keywordInput);

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

      // Create fields button and popup
      const fieldsButton = document.createElement('button');
      fieldsButton.textContent = '📑 Fields';  // Document emoji
      fieldsButton.style.padding = '5px 10px';
      fieldsButton.style.cursor = 'pointer';
      fieldsButton.style.marginRight = '10px';
      fieldsButton.title = 'Select Search Fields';

      // Create fields popup container
      const fieldsPopup = document.createElement('div');
      fieldsPopup.style.position = 'absolute';
      fieldsPopup.style.top = '100%';
      fieldsPopup.style.left = '0';
      fieldsPopup.style.backgroundColor = 'white';
      fieldsPopup.style.border = '1px solid #ddd';
      fieldsPopup.style.borderRadius = '4px';
      fieldsPopup.style.padding = '10px';
      fieldsPopup.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      fieldsPopup.style.display = 'none';
      fieldsPopup.style.zIndex = '1000';

      // Get API URL from environment variable
      const predicate_apiUrl = process.env.REACT_APP_DATA_API || './data/custom.json';

      // Remove trailing slash if it exists
      const cleanApiUrl = predicate_apiUrl.replace(/\/$/, '');

      // Fetch predicates from API and create checkboxes
      fetch(`${cleanApiUrl}/predicate`)
        .then(response => response.json())
        .then(predicates => {
          predicates.forEach(predicate => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.marginBottom = '5px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = predicate;
            checkbox.checked = predicate.toLowerCase().includes('keyword');
            checkbox.style.marginRight = '5px';
            
            // Add immediate change event listener
            checkbox.addEventListener('change', () => {
                handleSearch(); // Immediate search on checkbox change
                Graph.refresh(); // Force graph refresh
            });
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(predicate.charAt(0).toUpperCase() + predicate.slice(1)));
            fieldsPopup.appendChild(label);
          });

          // Initial search with default fields
          handleSearch();
          Graph.refresh(); // Force initial refresh
        })
        .catch(error => {
          console.error('Error fetching predicates:', error);
          // Fallback to default fields if API call fails
          const defaultFields = ['title', 'description', 'keyword'];
          defaultFields.forEach(field => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.marginBottom = '5px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = field;
            checkbox.checked = field === 'keyword'; // Only check if it's the keyword field
            checkbox.style.marginRight = '5px';
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(field.charAt(0).toUpperCase() + field.slice(1)));
            fieldsPopup.appendChild(label);
          });
        });

      // Toggle fields popup
      let isFieldsVisible = false;
      fieldsButton.addEventListener('click', () => {
        isFieldsVisible = !isFieldsVisible;
        fieldsPopup.style.display = isFieldsVisible ? 'block' : 'none';
        fieldsButton.style.backgroundColor = isFieldsVisible ? '#e0e0e0' : '';
      });

      // Close fields popup when clicking outside
      document.addEventListener('click', (e) => {
        if (!fieldsButton.contains(e.target) && !fieldsPopup.contains(e.target)) {
          fieldsPopup.style.display = 'none';
          isFieldsVisible = false;
          fieldsButton.style.backgroundColor = '';
        }
      });

      // Add fields button and popup to the container
      searchContainer.appendChild(fieldsButton);
      searchContainer.appendChild(fieldsPopup);

      // Create keyword container for input and suggestions
      const keywordContainer = document.createElement('div');
      keywordContainer.style.position = 'relative';

      // Create suggestions box
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

      // Create zoom-in button
      const zoomInButton = document.createElement('button');
      zoomInButton.textContent = '🔍+';  // Zoom in emoji
      zoomInButton.style.padding = '5px 10px';
      zoomInButton.style.cursor = 'pointer';
      zoomInButton.style.marginLeft = '10px';
      zoomInButton.title = 'Zoom In';

      // Create zoom-out button
      const zoomOutButton = document.createElement('button');
      zoomOutButton.textContent = '🔍-';  // Zoom out emoji
      zoomOutButton.style.padding = '5px 10px';
      zoomOutButton.style.cursor = 'pointer';
      zoomOutButton.style.marginLeft = '5px';
      zoomOutButton.title = 'Zoom Out';

      // Get initial distance
      const distance = 1000;

      // Zoom in functionality
      zoomInButton.addEventListener('click', () => {
        const currentDistance = Graph.cameraPosition().z;
        Graph.cameraPosition({ 
          x: Graph.cameraPosition().x,
          y: Graph.cameraPosition().y,
          z: currentDistance * 0.8  // Zoom in by reducing distance by 20%
        });
      });

      // Zoom out functionality
      zoomOutButton.addEventListener('click', () => {
        const currentDistance = Graph.cameraPosition().z;
        Graph.cameraPosition({ 
          x: Graph.cameraPosition().x,
          y: Graph.cameraPosition().y,
          z: currentDistance * 1.2  // Zoom out by increasing distance by 20%
        });
      });

      // Create all input elements first
      const subjectInput = document.createElement('input');
      subjectInput.style.padding = '5px';
      subjectInput.style.width = '150px';
      subjectInput.style.marginRight = '10px';
      subjectInput.placeholder = 'Search subjects...';

      const predicateInput = document.createElement('input');
      predicateInput.style.padding = '5px';
      predicateInput.style.width = '150px';
      predicateInput.style.marginRight = '10px';
      predicateInput.placeholder = 'Search predicates...';

      const objectInput = document.createElement('input');
      objectInput.style.padding = '5px';
      objectInput.style.width = '150px';
      objectInput.placeholder = 'Search objects...';

      // Create Advanced button
      const advancedButton = document.createElement('button');
      advancedButton.textContent = '⚙️ Advanced';  // Gear emoji
      advancedButton.style.padding = '5px 10px';
      advancedButton.style.cursor = 'pointer';
      advancedButton.style.marginLeft = '10px';
      advancedButton.title = 'Toggle Advanced Search';

      // Create container for advanced filters
      const advancedFilters = document.createElement('div');
      advancedFilters.style.display = 'none'; // Hidden by default
      advancedFilters.style.position = 'absolute';
      advancedFilters.style.top = '100%';
      advancedFilters.style.left = '0';
      advancedFilters.style.padding = '10px';
      advancedFilters.style.backgroundColor = 'white';
      advancedFilters.style.border = '1px solid #ddd';
      advancedFilters.style.borderRadius = '4px';
      advancedFilters.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      advancedFilters.style.marginTop = '10px';
      advancedFilters.style.zIndex = '1000';

      // Define handleSearch function after all inputs are created
      const handleSearch = () => {
        const keyword = keywordInput.value;
        const subject = subjectInput.value;
        const predicate = predicateInput.value;
        const object = objectInput.value;
        
        const params = new URLSearchParams();
        
        if (keyword) params.append('q', keyword);
        if (subject) params.append('subject', subject);
        if (predicate) params.append('predicate', predicate);
        if (object) params.append('object', object);

        // Get all checked fields
        const checkedFields = Array.from(fieldsPopup.querySelectorAll('input[type="checkbox"]:checked'))
          .map(checkbox => checkbox.value);
        
        // Add each checked field as a separate parameter
        checkedFields.forEach((field, index) => {
          params.append('field', field);
        });

        const searchUrl = `${apiUrl}?${params.toString()}`;

        fetch(searchUrl)
            .then(response => response.json())
            .then(data => {
                Graph.graphData(data);
                // Force graph refresh
                Graph.refresh();
            })
            .catch(error => console.error('Error:', error));
      };

      // Trigger the search to render the graph based on the default keyword
      handleSearch(); // Call the search function to update the graph

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
                      handleSearch(); // Call handleSearch to update the graph with the selected suggestion
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
        if (!searchContainer.contains(e.target)) {
          suggestionsBox.style.display = 'none';
        }
      });

      // Add toggle functionality for advanced filters
      let isAdvancedVisible = false;
      advancedButton.addEventListener('click', () => {
          isAdvancedVisible = !isAdvancedVisible;
          advancedFilters.style.display = isAdvancedVisible ? 'block' : 'none';
          advancedButton.style.backgroundColor = isAdvancedVisible ? '#e0e0e0' : '';
      });

      // Add event listeners for advanced inputs
      subjectInput.addEventListener('change', handleSearch);
      predicateInput.addEventListener('change', handleSearch);
      objectInput.addEventListener('change', handleSearch);

      // Append advanced filter inputs
      advancedFilters.appendChild(subjectInput);
      advancedFilters.appendChild(predicateInput);
      advancedFilters.appendChild(objectInput);

      // Append elements in the correct order
      keywordContainer.appendChild(keywordInput);
      keywordContainer.appendChild(suggestionsBox);
      searchContainer.appendChild(keywordContainer);
      searchContainer.appendChild(zoomInButton);
      searchContainer.appendChild(zoomOutButton);
      searchContainer.appendChild(advancedButton);
      searchContainer.appendChild(advancedFilters);

      // Create theme toggle button
      const themeButton = document.createElement('button');
      themeButton.textContent = '🌓';  // Moon/sun emoji
      themeButton.style.padding = '5px 10px';
      themeButton.style.cursor = 'pointer';
      themeButton.style.marginLeft = '10px';
      themeButton.title = 'Toggle Dark/Light Theme';
      themeButton.style.backgroundColor = '#ffffff';
      themeButton.style.border = '1px solid #ddd';
      themeButton.style.borderRadius = '4px';

      // Track theme state
      let isDarkTheme = false;

      // Theme toggle functionality
      themeButton.addEventListener('click', () => {
          isDarkTheme = !isDarkTheme;
          
          // Update background color
          document.body.style.backgroundColor = isDarkTheme ? '#1a1a1a' : '#ffffff';
          
          // Update graph colors
          Graph
              .backgroundColor(isDarkTheme ? '#1a1a1a' : '#ffffff')
              .nodeColor(node => isDarkTheme ? '#ffffff' : node.color || '#1a1a1a');

          // Update button appearance
          themeButton.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
          themeButton.style.color = isDarkTheme ? '#ffffff' : '#000000';
          themeButton.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';

          // Update advanced filters container if visible
          if (advancedFilters) {
              advancedFilters.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
              advancedFilters.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';
          }

          // Update suggestions box if it exists
          if (suggestionsBox) {
              suggestionsBox.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
              suggestionsBox.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';
          }

          // Update input fields
          const inputs = [keywordInput, subjectInput, predicateInput, objectInput];
          inputs.forEach(input => {
              if (input) {
                  input.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
                  input.style.color = isDarkTheme ? '#ffffff' : '#000000';
                  input.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';
              }
          });

          // Update other buttons
          const buttons = [advancedButton, zoomInButton, zoomOutButton];
          buttons.forEach(button => {
              if (button) {
                  button.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
                  button.style.color = isDarkTheme ? '#ffffff' : '#000000';
                  button.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';
              }
          });

          // Update fields button and popup
          updateTheme();
      });

      // Add this function before the theme toggle event listener
      const updateTheme = () => {
        fieldsButton.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
        fieldsButton.style.color = isDarkTheme ? '#ffffff' : '#000000';
        fieldsButton.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';
        
        fieldsPopup.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
        fieldsPopup.style.border = isDarkTheme ? '1px solid #444' : '1px solid #ddd';
        fieldsPopup.style.color = isDarkTheme ? '#ffffff' : '#000000';
      };

      // Add theme button to container (add it before other buttons)
      searchContainer.insertBefore(themeButton, searchContainer.firstChild);

      document.body.appendChild(searchContainer);
    });
  }, []);

  useEffect(() => {
    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('3d-graph').appendChild(renderer.domElement);

    // Set initial camera position
    camera.position.z = 5; // Adjust as needed
  }, []);


  return (
    <div className="App">

      <div id="3d-graph"></div>
    </div>
  );
}

export default App;
