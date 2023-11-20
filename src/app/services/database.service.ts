import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: IDBDatabase;

  private _dbInitiated$: Subject<void> = new Subject<void>();
  public dbInitiated$: Observable<void> = this._dbInitiated$.asObservable();

  private _dbChanges$: Subject<void> = new Subject<void>();
  public dbChanges$: Observable<void> = this._dbChanges$.asObservable();

  public initDB(config: DBConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(config.name, config.version);
      request.onerror = (event) => {
        console.log(event);
        reject();
      };
      request.onsuccess = (event) => {
        this.db = (event.target as any).result;
        this._dbInitiated$.next();
        console.log(this.db);
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as any).result;
        for (let store of (config.stores || [])) {
          if (!db.objectStoreNames.contains(store)) {
            const peopleStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
            for (let index of (store.indexes || [])) {
              peopleStore.createIndex(index.key, index.key, { unique: index.unique });
            }
          }
        }
      };
    });
  }

  public add<T>(store: string, value: T): Observable<void> {
    return from(new Promise<void>((resolve, reject) => {
      if (!this.db?.objectStoreNames?.contains(store)) {
        reject('There is no such store in DB');
      }
      const request = this.db
        .transaction([store], 'readwrite')
        .objectStore(store)
        .put(value);
      request.onsuccess = () => {
        resolve();
        console.log('add');
        this._dbChanges$.next();
      };
      request.onerror = (error) => reject(error);
    }))
  }

  public count(store: string): Observable<number> {
    return from(new Promise<number>((resolve, reject) => {
      if (!this.db?.objectStoreNames?.contains(store)) {
        reject('There is no such store in DB');
      }
      const count = this.db
        .transaction([store], 'readonly')
        .objectStore(store)
        .count();
      count.onsuccess = () => resolve(count.result);
      count.onerror = (error) => reject(error);
    }))
  }

  public getMany<T>(store: string, start: number = 1, end: number = 0): Observable<T[]> {
    return from(new Promise<T[]>((resolve, reject) => {
      if (!this.db?.objectStoreNames?.contains(store)) {
        reject('There is no such store in DB');
      }
      const result: T[] = [];
      const cursor = this.db
        .transaction([store], 'readonly')
        .objectStore(store)
        .openCursor(IDBKeyRange.bound(start, end, true, false));
      cursor.onsuccess = (event) => {
        const cursorWithValue: IDBCursorWithValue = (event.target as any).result;
        if (cursorWithValue?.value) {
          result.push(cursorWithValue.value);
          cursorWithValue.continue();
        } else {
          resolve(result);
        }
      };
    }))
  }
}
