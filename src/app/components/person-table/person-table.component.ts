import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription, combineLatest, debounceTime, pairwise, startWith, switchMap, tap, throttleTime } from 'rxjs';
import { Person } from 'src/app/entities/person';
import { PersonService } from 'src/app/services/person.service';

@Component({
  selector: 'app-person-table',
  templateUrl: './person-table.component.html',
  styleUrls: ['./person-table.component.scss']
})
export class PersonTableComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport) private readonly viewport: CdkVirtualScrollViewport;

  public readonly itemSize: number = 30;
  public readonly itemsPerPage: number = 100;
  public count: number;
  public persons: Person[] = [];

  public countSub: Subscription;
  public personSub: Subscription;

  constructor(private personService: PersonService, private cdRef: ChangeDetectorRef) {}

  public ngOnInit() {
    this.countSub = this.personService.count$.subscribe((count) => {
      this.count = count;
      this.cdRef.detectChanges();
    });
    this.personSub = combineLatest([
      this.personService.count$,
      this.personService.page$,
    ]).pipe(
      startWith([]),
      pairwise(),
    ).subscribe(([[prevCount, prevPage], [currCount, currPage]]) => {
      if (currPage === prevPage && currCount < (this.itemsPerPage * (currPage + 1))) {
        this.personService.getPersons().subscribe((persons: Person[]) => {
          this.persons = [...this.persons.slice(0, this.itemsPerPage * prevPage), ...persons];
          this.cdRef.detectChanges();
        });
      } else if (currPage !== prevPage) {
        this.personService.getPersons().subscribe((persons: Person[]) => {
          this.persons = [...this.persons, ...persons];
          this.cdRef.detectChanges();
        });
      }
    })
    this.personService.loadPersons();
  }

  public ngOnDestroy(): void {
    this.countSub.unsubscribe();
    this.personSub.unsubscribe();
  }

  public onScrollIndexChange(): void {
    const lastRenderedIndex = this.viewport.getRenderedRange().end;
    const totalItems = this.viewport.getDataLength();
    if (lastRenderedIndex && totalItems && lastRenderedIndex === totalItems) {
      this.personService.nextPage();
    }
  }

  public trackById(index: number, person: Person): string {
    return person.userId;
  }
}
