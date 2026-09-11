const { app } = require('@azure/functions');
const sql = require('mssql');

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,      // e.g. myserver.database.windows.net
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

app.http('students', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        let pool;
        try {
            pool = await sql.connect(config);
            const result = await pool.request().query(
                'SELECT Country, COUNT(*) AS StudentCount ' +
                'FROM Students GROUP BY Country ORDER BY StudentCount DESC'
            );
            return { jsonBody: result.recordset };
        } catch (err) {
            context.error(err);
            return { status: 500, jsonBody: { error: err.message } };
        } finally {
            if (pool) await pool.close();
        }
    }
});
