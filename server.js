const cors = require('cors');

// ... other imports ...

app.use(cors({
  origin: '*', // Replace with your frontend URL
  credentials: false
})); 