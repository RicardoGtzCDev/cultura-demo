import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

export interface IGetArtWorksPayload {
  keys: string,
  filters: string,
  language: string,
  offset: number,
  rows: number,
}

export interface IArtWork {
  title: string;
  artist: string[];
  image_thumbnail: string;
  object_number: string;
}

@Injectable({
  providedIn: 'root'
})
export class SmkService {
  private _http: HttpClient = inject(HttpClient);


  getArtWorks(payload: IGetArtWorksPayload) {
    return this._http.post<IArtWork[]>('https://app.aprende.org/cultura/api/Artworks/GeneralSearch', payload)
      .pipe(
        map((elements) => {
          const baseUrl = 'https://app.aprende.org/cultura/api/Artworks/Image?Url=';
          return elements.map((element) => {
            const thumbnail = element.image_thumbnail;
            const sufixUrl = thumbnail.includes('!1024')
              ? thumbnail.replace('!1024', '!320')
              : thumbnail;
            return {
              ...element,
              image_thumbnail: `${baseUrl}${sufixUrl}`,
            }
          });
        })
      );
  }
}
