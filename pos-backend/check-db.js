const db = require('./db');

async function run() {
    try {
        await db.query('ALTER TABLE transaksi ADD COLUMN bukti_transaksi VARCHAR(255) DEFAULT NULL');
        console.log("Column added");
    } catch (err) {
        console.error(err);
    }
    process.exit();
}
run();
