require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middleware/errorHandler');
const cors = require('cors');
const apiRoutes = require('./src/routes/apiRoutes');






const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost', 'http://localhost:3000',];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);







// Routes
app.use('/api', apiRoutes);




app.use(errorHandler);
const start = async () => {
    try {

        sequelize.authenticate()
            .then(async () => {
                const [result] = await sequelize.query('SELECT current_user;');
                console.log('Connected as DB user:', result[0].current_user);
            })
            .catch(err => console.error('Auth failed:', err));

        await sequelize.sync();
        console.log("Database synced successfully.");

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`);
        });

        process.on('SIGINT', () => {
            app.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGTERM', () => {
            app.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error("Unable to sync database:", error);
    }
};

start();
