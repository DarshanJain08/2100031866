const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

let accessToken = ""; 

const windowSize = 10;
let windowNumbers = [];

const identifierMap = {
    'f': 'fibo',
    'e': 'even',
    'p': 'primes',
    'r': 'rand'
};

function calculateAverage(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length || 0;
}

app.use(express.json());

async function fetchAccessToken() {
    const apiCredentials = {"companyName":"goMart","clientID":"09379568-b115-4260-a545-582c41cba7fe","clientSecret":"PXBegPYJJSXwRXFk","ownerName":"Darshan Jain","ownerEmail":"2100031866cseh@gmail.com","rollNo":"2100031866"};

    try {
        const response = await axios.post('http://20.244.56.144/test/auth', apiCredentials);
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.message);
        throw new Error("Failed to fetch access token");
    }
}

async function initializeServer() {
    try {
        accessToken = await fetchAccessToken();
        console.log("Access token fetched successfully:");
    } catch (error) {
        console.error("Error initializing server:", error.message);
        process.exit(1); 
    }

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

initializeServer();

app.get('/numbers/:numberid', async (req, res) => {
    const shortIdentifier = req.params.numberid;
    const fullIdentifier = identifierMap[shortIdentifier];

    if (!fullIdentifier) {
        return res.status(400).json({ error: "Invalid identifier" });
    }

    try {
        const response = await axios.get(`http://20.244.56.144/test/${fullIdentifier}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const numbers = response.data.numbers || [];

        const uniqueNumbers = [...new Set(numbers)];

        if (windowNumbers.length >= windowSize) {
            windowNumbers.shift(); // Remove oldest number
        }
        windowNumbers = [...windowNumbers, ...uniqueNumbers];

        const average = calculateAverage(windowNumbers);

        const responseData = {
            numbers: uniqueNumbers,
            windowPrevState: [...windowNumbers.slice(0, -uniqueNumbers.length)],
            windowCurrState: [...windowNumbers],
            avg: average.toFixed(2)
        };

        res.json(responseData);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

