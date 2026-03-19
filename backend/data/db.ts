import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, 'internal-db.json');
let dbCache: any = null;

export const getDB = () => {
    if (!dbCache) {
        if (!fs.existsSync(dbPath)) return {};
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        dbCache = JSON.parse(fileContent);
    }
    return dbCache;
};

export const getCollection = (collectionName: string) => {
    const db = getDB();
    return db[collectionName] || null;
};

export const findEntity = (collectionName: string, query: (item: any) => boolean) => {
    const collection = getCollection(collectionName);
    if (!Array.isArray(collection)) return null;
    return collection.find(query) || null;
};

export const filterEntities = (collectionName: string, query: (item: any) => boolean) => {
    const collection = getCollection(collectionName);
    if (!Array.isArray(collection)) return [];
    return collection.filter(query);
};
