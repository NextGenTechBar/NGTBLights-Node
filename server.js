import express from 'express'; // import express
const app = express(); // creating an express app
const PORT = 3001; // setting the port, default to 3000 if not specified

app.use(express.static('public')); // serve static files from the 'public' directory

// Route to get weather data based on city and state
app.get('/test', async (req, res) => {
    res.json({ message: 'hello world' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // log that the server is running
});