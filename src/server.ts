import dotenv from 'dotenv';
import app from './app.js'; // Note the .js extension! (Required for NodeNext module resolution)

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Headless Core running on http://localhost:${PORT}`);
});
