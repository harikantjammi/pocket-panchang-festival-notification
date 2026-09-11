import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const FESTIVALS_TABLE_ID = process.env.FESTIVALS_TABLE_ID;

export async function getFestivalsForDate(tablesDB, { day, month, year }) {
  const response = await tablesDB.listRows(DATABASE_ID, FESTIVALS_TABLE_ID, [
    Query.equal('day', day),
    Query.equal('month', month),
    Query.equal('year', year),
  ]);

  const [row] = response.rows;

  if (!row) {
    return [];
  }

  return row.festival.split(',').map((festival) => festival.trim());
}
