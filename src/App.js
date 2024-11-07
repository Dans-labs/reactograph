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
        });

      // Create keyword input
      const keywordInput = document.createElement('input');
      keywordInput.style.padding = '5px';
      keywordInput.style.width = '300px';
      keywordInput.style.fontSize = '14px';
      keywordInput.placeholder = 'Search keywords...';
      keywordInput.style.marginRight = '20px';

      // Set default value for the keyword input
      keywordInput.value = 'africa'; // Set default term to "africa"

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

      // Create keyword search input and suggestions container
      const keywordContainer = document.createElement('div');
      keywordContainer.style.position = 'relative';

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

      // Function to handle search
      const handleSearch = () => {
        const keyword = keywordInput.value;
        const params = new URLSearchParams();

        if (keyword) params.append('q', keyword); // Assuming 'q' is the parameter for the keyword

        const searchUrl = `${apiUrl}?${params.toString()}`;

        fetch(searchUrl)
          .then(response => response.json())
          .then(data => {
            // Update the graph with new data
            Graph.graphData(data); // Assuming this method updates the graph with new data
          })
          .catch(error => console.error('Error fetching data:', error));
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
        if (!keywordContainer.contains(e.target)) {
          suggestionsBox.style.display = 'none';
        }
      });

      // Append elements
      keywordContainer.appendChild(keywordInput);
      keywordContainer.appendChild(suggestionsBox);
      searchContainer.appendChild(keywordContainer);
      document.body.appendChild(searchContainer); // Append the search container to the body

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

      // Add theme toggle button
      const themeButton = document.createElement('button');
      themeButton.textContent = '🌓'; // Moon/sun emoji as icon
      themeButton.style.padding = '5px 10px';
      themeButton.style.marginRight = '20px';
      themeButton.style.cursor = 'pointer';
      themeButton.style.backgroundColor = '#f0f0f0';
      themeButton.style.border = '1px solid #ddd';
      themeButton.style.borderRadius = '4px';
      themeButton.title = 'Toggle dark/light mode';

      let isDarkMode = false;
      themeButton.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        
        // Toggle background color
        document.body.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
        
        // Update graph colors
        Graph
          .backgroundColor(isDarkMode ? '#1a1a1a' : '#ffffff')
          .nodeColor(node => isDarkMode ? node.color || '#ffffff' : node.color || '#1a1a1a')
          .linkColor(isDarkMode ? '#ffffff' : '#1a1a1a');

        // Update button appearance
        themeButton.style.backgroundColor = isDarkMode ? '#333333' : '#f0f0f0';
        themeButton.style.color = isDarkMode ? '#ffffff' : '#000000';
      });

      // Add button to container (add it near the start of your container)
      searchContainer.insertBefore(themeButton, searchContainer.firstChild);

      // Create zoom-in button
      const zoomInButton = document.createElement('button');
      zoomInButton.textContent = 'Zoom In';
      zoomInButton.style.padding = '5px 10px';
      zoomInButton.style.marginRight = '10px';
      zoomInButton.style.cursor = 'pointer';

      // Create zoom-out button
      const zoomOutButton = document.createElement('button');
      zoomOutButton.textContent = 'Zoom Out';
      zoomOutButton.style.padding = '5px 10px';
      zoomOutButton.style.cursor = 'pointer';

      // Initial scale factor
      let scaleFactor = 1;

      // Function to update graph rendering based on scale
      const updateGraphScale = () => {
        // Assuming you have a method to update the graph's scale
        Graph.setScale(scaleFactor); // Replace with your actual method to set scale
        // You may need to re-render the graph or update its layout
        Graph.refresh(); // Call this if your library requires a refresh after scaling
      };

      // Zoom in functionality
      zoomInButton.addEventListener('click', () => {
        scaleFactor *= 1.2; // Increase scale by 20%
        updateGraphScale();
      });

      // Zoom out functionality
      zoomOutButton.addEventListener('click', () => {
        scaleFactor /= 1.2; // Decrease scale by 20%
        updateGraphScale();
      });

      // Add buttons to the search container
      //searchContainer.appendChild(zoomInButton);
      //searchContainer.appendChild(zoomOutButton);

      // Cleanup on unmount
      return () => {
        document.body.removeChild(searchContainer);
      };
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
