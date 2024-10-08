// src/services/cache.ts

import Dexie, { Table } from "dexie";

// Existing CacheEntry interface (for reference)
export interface CacheEntry {
  id?: number; // Optional ID for auto-increment
  data: string; // Encrypted data as a base64 string
  timestamp: number; // Unix timestamp in milliseconds
}

// Define a new interface for file cache entries
export interface FileCacheEntry {
  id?: number; // Optional ID for auto-increment
  fileName: string; // Unique identifier, preferably including path or unique hash
  blob: Blob; // The actual file data as a Blob
  objectUrl: string; // URL created from the Blob for display
  timestamp: number; // Unix timestamp in milliseconds
}

// Extend the AppCache class to include the files table
class AppCache extends Dexie {
  movements: Table<CacheEntry>;
  clients: Table<CacheEntry>;
  agents: Table<CacheEntry>;
  admins: Table<CacheEntry>;
  visits: Table<CacheEntry>;
  promos: Table<CacheEntry>;
  files: Table<FileCacheEntry>; // Separate the FileCacheEntry type

  constructor() {
    super("AppCache");
    this.version(1).stores({
      movements: "++id,timestamp",
      clients: "++id,timestamp",
      agents: "++id,timestamp",
      admins: "++id,timestamp",
      visits: "++id,timestamp",
      promos: "++id,timestamp",
      files: "++id,fileName,timestamp", // Add the files table
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
