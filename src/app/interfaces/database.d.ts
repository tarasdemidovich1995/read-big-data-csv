interface DBStoreIndexConfig {
  key: string;
  unique: boolean;
}

interface DBStoreConfig {
  name: string;
  keyPath: string;
  indexes: DBStoreIndexConfig[];
}

interface DBConfig {
  name: string;
  version: number;
  stores: DBStoreConfig[];
}
