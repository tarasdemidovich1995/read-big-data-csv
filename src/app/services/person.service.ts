import { Injectable } from '@angular/core';
import { StreamService } from './stream.service';
import { DatabaseService } from './database.service';
import { BehaviorSubject, Observable, throttleTime, filter, lastValueFrom, mergeMap, take, switchMap, merge, tap, shareReplay, delay } from 'rxjs';
import { Person } from '../entities/person';
import { PEOPLE_STORE } from '../constants/global';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly itemsPerPage: number = 100;
  private readonly rowsCount: number = 100000;

  private _page$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public page$: Observable<number> = this._page$.asObservable();

  private _loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loading$.asObservable();

  constructor(
    private streamService: StreamService,
    private dbService: DatabaseService,
  ) {}

  public count$: Observable<number> = merge(
    this.dbService.dbInitiated$,
    this.dbService.dbChanges$,
  ).pipe(
    throttleTime(1000, null, { leading: true, trailing: true }),
    mergeMap(() => this.dbService.count(PEOPLE_STORE)),
    shareReplay(1),
  );

  public getPersons(): Observable<Person[]> {
    return this.page$.pipe(
      take(1),
      switchMap((page) => this.dbService.getMany<Person>(PEOPLE_STORE, page * this.itemsPerPage, this.itemsPerPage * (page + 1)))
    );
  }

  public persons$: Observable<Person[]> = this.page$.pipe(
    switchMap((page) => this.dbService.getMany<Person>(PEOPLE_STORE, page * this.itemsPerPage, this.itemsPerPage * (page + 1))),
  );

  public loadPersons(): void {
    this.count$.pipe(
      take(1),
      filter((count: number) => count < this.rowsCount)
    ).subscribe((count) => {
      console.log(count)
      this._loading$.next(true);
      this.streamService.csv('assets/people-100000.csv').then((stream: ReadableStream) => stream.pipeTo(new WritableStream({
        // without delay it blocks the microtasks queue and it's executes infinitely
        write: (data: string) => lastValueFrom(this.dbService.add(PEOPLE_STORE, Person.fromCsv(data)).pipe(delay(10))),
      }))).finally(() => this._loading$.next(false))
    })
  }

  public nextPage(): void {
    this.count$.pipe(
      take(1),
      filter((count: number) => count > (this._page$.getValue() + 1) * this.itemsPerPage)
    ).subscribe(() => {
      this._page$.next(this._page$.getValue() + 1);
    })
  }
}
