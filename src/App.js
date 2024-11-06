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
        const subject = subjectInput.value;
        const predicate = predicateInput.value;
        const object = objectInput.value;
        
        // Construct query parameters
        const params = new URLSearchParams(new URL(apiUrl).search);
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

      [subjectInput, predicateInput, objectInput].forEach(input => {
        input.addEventListener('input', () => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(handleSearch, debounceDelay);
        });
      });

      // Append all elements to the container
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
