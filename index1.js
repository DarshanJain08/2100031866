const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const accmpny = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const accgt = [ "Computer","Phone", "TV", "Earphone", "Tablet",  "Bluetooth","Charger", "Mouse", "Keypad", "Pendrive", "Remote", "Laptop", "Headset", "Speaker", "PC"];

let accessToken = '';

function validateCompanyAndCategory(company, category) {
    return accmpny.includes(company) && accgt.includes(category);
}

async function fetchAuthToken(companyName, clientID, clientSecret, ownerName, ownerEmail, rollNo) {
    const response = await axios.post('http://20.244.56.144/test/auth', {
        companyName,
        clientID,
        clientSecret,
        ownerName,
        ownerEmail,
        rollNo
    });
    return response.data.access_token;
}

async function statApp() {
    try {
        accessToken = await fetchAuthToken("goMart", "09379568-b115-4260-a545-582c41cba7fe", "PXBegPYJJSXwRXFk", "Darshan Jain", "2100031866cseh@gmail.com", "2100031866");
        console.log(accessToken)
    } catch (error) {
        console.error('Error', error);
    }
}

statApp();

async function fetchProducts(company, category, top, minPrice, maxPrice) {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products`, {
        params: {
            top,
            minPrice,
            maxPrice
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
}

async function getData(company, category, productid) {
    const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${category}/products/${productid}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data;
}

app.get('/categories/:categoryname/products', async (req, res) => {
    try {
        const { categoryname } = req.params;
        const { top, minPrice, maxPrice, sortBy, sortOrder, page = 1, company } = req.query;

        if (!validateCompanyAndCategory(company, categoryname)) {
            return res.status(400).json({ error: 'Invalid company or category' });
        }

        const products = await fetchProducts(company, categoryname, top, minPrice, maxPrice);

        const startIndex = (page - 1) * top;
        const endIndex = page * top;
        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    try {
        const { categoryname, productid } = req.params;
        const { company } = req.query;

        if (!validateCompanyAndCategory(company, categoryname)) {
            return res.status(400).json({ error: 'Invalid company or category' });
        }

        const prodData = await getData(company, categoryname, productid);

        res.json(prodData);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
