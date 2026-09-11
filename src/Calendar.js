import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const FESTIVALS_COLLECTION_ID = process.env.APPWRITE_FESTIVALS_COLLECTION_ID;

export async function getFestivalsForDate(databases, { day, month, year }) {
  const response = await databases.listDocuments(DATABASE_ID, FESTIVALS_COLLECTION_ID, [
    Query.equal('day', day),
    Query.equal('month', month),
    Query.equal('year', year),
  ]);

  const [document] = response.documents;

  if (!document) {
    return [];
  }

  return document.festival.split(',').map((festival) => festival.trim());
}
