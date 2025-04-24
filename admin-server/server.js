const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../admin.html')));

const filePath = path.join(__dirname, '../data/products.json');

// Получить все товары
app.get('/api/products', (req, res) => {
    const products = JSON.parse(fs.readFileSync(filePath));
    res.json(products);
});

// Добавить товары
app.post('/api/products', (req, res) => {
    const products = JSON.parse(fs.readFileSync(filePath));
    const newProducts = req.body.map((product, index) => ({ id: products.length + index + 1, ...product }));
    products.push(...newProducts);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    res.status(201).json(newProducts);
});

// Редактировать товар по ID
app.put('/api/products/:id', (req, res) => {
    let products = JSON.parse(fs.readFileSync(filePath));
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).send('Товар не найден');
    products[index] = { ...products[index], ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    res.json(products[index]);
});

// Удалить товар по ID
app.delete('/api/products/:id', (req, res) => {
    let products = JSON.parse(fs.readFileSync(filePath));
    const id = parseInt(req.params.id);
    products = products.filter(p => p.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    res.status(204).send();
});

// Страница админ-панели
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.listen(PORT, () => console.log(`Admin server running at http://localhost:${PORT}/admin`));
