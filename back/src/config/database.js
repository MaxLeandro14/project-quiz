export default {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'docker',
    password: process.env.DB_PASSWORD || 'docker',
    database: process.env.DB_DATABASE || 'api_back',
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
    }
}
