const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Раздаем статические файлы (index.html)
app.use(express.static(path.join(__dirname, '../frontend')));

// Загружаем товары из JSON
const getProducts = () => {
    const data = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf-8');
    return JSON.parse(data);
};

// Определяем GraphQL схему
const schema = buildSchema(`
    type Product {
        id: ID!
        name: String!
        price: Float!
        description: String
        categories: [String]!
    }

    type Query {
        products: [Product]
        product(id: ID!): Product
    }
`);

const root = {
    products: () => getProducts(),
    product: ({ id }) => getProducts().find(p => p.id == id)
};

// Настраиваем GraphQL сервер
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true  // Включаем GraphiQL для тестирования API
}));

// Запускаем сервер
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}\nGraphQL API: http://localhost:${PORT}/graphql`));
