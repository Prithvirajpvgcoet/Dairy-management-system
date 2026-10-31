const pool = require('../config/db');

const list = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const create = async (req, res) => {
    try {
        const { name, unit, price_per_unit, icon, in_stock } = req.body;
        await pool.query(
            'INSERT INTO products (name, unit, price_per_unit, icon, in_stock) VALUES (?, ?, ?, ?, ?)',
            [name, unit, price_per_unit, icon || '📦', in_stock ?? true]
        );
        res.status(201).json({ message: 'Product created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit, price_per_unit, icon, in_stock } = req.body;
        await pool.query(
            'UPDATE products SET name=?, unit=?, price_per_unit=?, icon=?, in_stock=? WHERE id=?',
            [name, unit, price_per_unit, icon, in_stock, id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id=?', [id]);
        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const listPublic = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE in_stock = true ORDER BY id ASC');
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { list, create, update, remove, listPublic };
