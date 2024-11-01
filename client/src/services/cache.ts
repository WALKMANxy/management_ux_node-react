// src/services/cache.ts
import Dexie, { Table } from "dexie";

export interface CacheEntry {
  id?: number;
  data: string;
  timestamp: number;
}

// Define a new interface for file cache entries
export interface FileCacheEntry {
  id?: number;
  fileName: string;
  blob: Blob;
  objectUrl: string;
  timestamp: number;
}

// Extend the AppCache class to include the files table
class AppCache extends Dexie {
  movements: Table<CacheEntry>;
  clients: Table<CacheEntry>;
  agents: Table<CacheEntry>;
  admins: Table<CacheEntry>;
  visits: Table<CacheEntry>;
  promos: Table<CacheEntry>;
  files: Table<FileCacheEntry>;

  constructor() {
    super("AppCache");
    this.version(1).stores({
      movements: "++id,timestamp",
      clients: "++id,timestamp",
      agents: "++id,timestamp",
      admins: "++id,timestamp",
      visits: "++id,timestamp",
      promos: "++id,timestamp",
      files: "++id,fileName,timestamp",
    });

    // Initialize the CacheEntry tables
    [
      this.movements,
      this.clients,
      this.agents,
      this.admins,
      this.visits,
      this.promos,
    ] = ["movements", "clients", "agents", "admins", "visits", "promos"].map(
      (table) => this.table(table)
    );

    // Initialize the FileCacheEntry table separately
    this.files = this.table("files");
  }
}

export const appCache = new AppCache();
