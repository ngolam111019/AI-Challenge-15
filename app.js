const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.locals.JSON = JSON;
    next();
});

// Nunjucks Configuration (Jinja2-like)
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true // Set to false in production
});

app.set('view engine', 'njk');

// Routes
app.use('/api', require('./routes/api'));
app.use('/tenants', require('./routes/tenants'));

app.get('/', (req, res) => {
    res.redirect('/tenants');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
