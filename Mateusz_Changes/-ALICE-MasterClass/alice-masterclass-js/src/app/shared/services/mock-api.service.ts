// ...existing code...
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService, Session, VisualAnalysisResultsEntry, LargeScaleAnalysisResultsEntry } from './api.service';

@Injectable({ providedIn: 'root' })
export class MockApiService extends ApiService {

  constructor() {
    // Nie wywołujemy super z HttpClient; pola ApiService są nadal dostępne
    super(null as any, null as any, null as any);
  }

  authenticate(password: string, studentID: number): Observable<Session> {
    // Zawsze zwracaj sukces w trybie mock (dla teachera)
    const session: Session = { error: false, name: `Teacher (mock)` };
    // Ustaw lokalne pola tak, żeby reszta aplikacji działała
    this.password = password;
    this.studentID = studentID;
    this.sessionName = session.name;
    return of(session);
  }

  // Pozostałe metody, które frontend może wywołać, zwracają sukces bez efektu
  submitVisualAnalysisResults(results: Map<string, VisualAnalysisResultsEntry>, datasetID: number): Observable<any> {
    console.log('[MockApiService] submitVisualAnalysisResults', datasetID, Array.from(results.entries()));
    return of({ ok: true });
  }

  submitLargeScaleAnalysisResults(results: Map<string, LargeScaleAnalysisResultsEntry>): Observable<any> {
    console.log('[MockApiService] submitLargeScaleAnalysisResults', Array.from(results.entries()));
    return of({ ok: true });
  }

  // Jeśli potrzebujesz dodatkowych metod GET, dodaj je tutaj i zwróć of(mock)
}
// ...existing code...
