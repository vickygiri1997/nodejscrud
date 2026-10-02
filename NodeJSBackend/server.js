const express= require('express');
const userRoutes = require('./route/userRoutes');

const app= express();
const port= process.env.PORT || 9000;

app.use(express.json());
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});








 