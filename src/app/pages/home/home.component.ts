import { Component, computed, ElementRef, inject, Signal, signal, viewChild, WritableSignal, AfterViewInit } from '@angular/core';
import { IArtWork, SmkService } from '../../api/smk.service';
import { debounceTime, fromEvent } from 'rxjs';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';


@Component({
  selector: 'cpe-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements AfterViewInit {
  // directivas
  scrollableDiv = viewChild<ElementRef>('scrollableDiv');
  // injects de servicios
  private _smkService: SmkService = inject(SmkService);
  private _notNullFB: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  // forms
  searchQuery = this._notNullFB.control('');
  // variables de solo lectura
  readonly rows = 10;
  // variables
  artWorks: WritableSignal<IArtWork[]> = signal([]);
  page: WritableSignal<number> = signal(0);
  pageOffset: Signal<number> = computed(() => this.page() * this.rows);
  pageOffset$ = toObservable(this.pageOffset);

  constructor() {
    this.getArtWorks();
    this.pageOffset$
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (offset) => {
          if (offset) {
            this.getArtWorks();
          }
        }
      });
  }

  ngAfterViewInit() {
    this.detectScrollEnd();
  }

  private detectScrollEnd() {
    const element = this.scrollableDiv();
    if (element) {
      fromEvent(element.nativeElement, 'scroll')
        .pipe(
          debounceTime(300)
        ).subscribe(() => {
          const element = this.scrollableDiv();
          if (element) {
            const div = element.nativeElement;
            const scrollTop = div.scrollTop;
            const scrollHeight = div.scrollHeight;
            const clientHeight = div.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 1) {
              this.page.update((current) => current + 1);
            }
          }
        });
    }
  }

  getArtWorks() {
    this._smkService.getArtWorks({
      keys: '*',
      filters: '',
      language: 'en',
      offset: this.pageOffset(),
      rows: this.rows,
    }).subscribe({
      next: (response) => {
        this.artWorks.update((current) => [...current, ...response]);
      },
      error: (e) => {
        console.log(e);

      },
    });
  }

  searchArtWorks() {
    this._smkService.getArtWorks(
      {
        keys: this.searchQuery.value,
        filters: '',
        language: 'en',
        offset: 0,
        rows: 100,
      }
    ).subscribe({
      next: (response) => this.artWorks.set(response)
    });
  }
}
