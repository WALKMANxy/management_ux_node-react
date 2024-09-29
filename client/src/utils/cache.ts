import Dexie, { Table } from "dexie";

export interface CacheEntry {
  id?: number; // Optional ID for auto-increment
  data: string; // Encrypted data as a base64 string
  timestamp: number; // Unix timestamp in milliseconds
}

class AppCache extends Dexie {
  movements: Table<CacheEntry>;
  clients: Table<CacheEntry>;
  agents: Table<CacheEntry>;
  admins: Table<CacheEntry>;
  visits: Table<CacheEntry>;
  promos: Table<CacheEntry>;

  constructor() {
    super("AppCache");
    this.version(1).stores({
      movements: "++id,timestamp",
      clients: "++id,timestamp",
      agents: "++id,timestamp",
      admins: "++id,timestamp",
      visits: "++id,timestamp",
      promos: "++id,timestamp",
    });
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
  }
}
export const appCache = new AppCache();
