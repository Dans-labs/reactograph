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

      // Add search/filter functionality
      const searchInput = document.createElement('input');
      searchInput.style.position = 'absolute';
      searchInput.style.top = '20px';
      searchInput.style.left = '20px';
      searchInput.style.zIndex = '1';
      searchInput.style.padding = '5px';
      searchInput.placeholder = 'Search all nodes...';
      document.body.appendChild(searchInput);

      // Add debounce function to prevent too many API calls
      const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      };

      // Function to fetch and update graph data
      const fetchGraphData = async (query) => {
        try {
          const apiUrl = process.env.REACT_APP_DATA_API || '/data/custom.json';
          const response = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}`);
          const newData = await response.json();
          
          Graph.graphData({
            nodes: newData.nodes.map(node => ({
              ...node,
              hidden: false
            })),
            links: newData.links
          });
        } catch (error) {
          console.error('Error fetching graph data:', error);
        }
      };

      // Debounced version of fetchGraphData (wait 300ms between calls)
      const debouncedFetch = debounce(fetchGraphData, 300);

      // Modified search input handler
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.length >= 2) {
          // Fetch new data if search term is at least 2 characters
          debouncedFetch(searchTerm);
        } else if (searchTerm.length === 0) {
          // Reset to initial data when search is cleared
          fetchGraphData('');
        }
      });

      // Initial data load
      fetchGraphData('');

      // Cleanup on unmount
      return () => {
        document.body.removeChild(searchInput);
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
