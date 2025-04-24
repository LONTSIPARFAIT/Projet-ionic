import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/contact_api/index.php';
  private pendingActionsKey = 'pendingActions'; // Clé pour localStorage

  constructor(private http: HttpClient) {}

  // Vérifier la connexion
  private isOnline(): boolean {
    return navigator.onLine;
  }

  // Obtenir les actions en attente
  private getPendingActions(): any[] {
    return JSON.parse(localStorage.getItem(this.pendingActionsKey) || '[]');
  }

  // Sauvegarder une action en attente
  private savePendingAction(action: any) {
    const pending = this.getPendingActions();
    pending.push(action);
    localStorage.setItem(this.pendingActionsKey, JSON.stringify(pending));
  }

  // Synchroniser les actions en attente
  syncPendingActions(): Observable<any> {
    if (!this.isOnline()) {
      return of({ status: 'offline', message: 'Pas de connexion, synchronisation différée.' });
    }

    const pending = this.getPendingActions();
    if (pending.length === 0) {
      return of({ status: 'success', message: 'Aucune action à synchroniser.' });
    }

    // Exécuter chaque action en attente
    const requests = pending.map((action: any) => {
      if (action.type === 'submit') {
        return this.http.post(this.apiUrl, action.data).pipe(
          catchError(() => of({ status: 'error', message: `Erreur lors de la soumission ${action.data}` }))
        );
      } else if (action.type === 'update') {
        return this.http.put(this.apiUrl, action.data).pipe(
          catchError(() => of({ status: 'error', message: `Erreur lors de la mise à jour ${action.data}` }))
        );
      } else if (action.type === 'delete') {
        return this.http.delete(this.apiUrl, { body: action.data }).pipe(
          catchError(() => of({ status: 'error', message: `Erreur lors de la suppression ${action.data.id}` }))
        );
      }
      return of({ status: 'error', message: 'Action inconnue' });
    });

    // Une fois toutes les actions synchronisées, vider les actions en attente
    return new Observable(observer => {
      requests.forEach((req, index) => {
        req.subscribe(() => {
          if (index === requests.length - 1) {
            localStorage.setItem(this.pendingActionsKey, '[]');
            observer.next({ status: 'success', message: 'Actions synchronisées.' });
            observer.complete();
          }
        });
      });
    });
  }

  submitForm(data: any): Observable<any> {
    if (this.isOnline()) {
      return this.http.post(this.apiUrl, data).pipe(
        catchError(error => {
          this.savePendingAction({ type: 'submit', data });
          return of({ status: 'pending', message: 'Soumission enregistrée localement, synchronisation en attente.' });
        })
      );
    } else {
      this.savePendingAction({ type: 'submit', data });
      return of({ status: 'pending', message: 'Pas de connexion, soumission enregistrée localement.' });
    }
  }

  getSubmissions(): Observable<any> {
    if (this.isOnline()) {
      return this.http.get(this.apiUrl).pipe(
        catchError(() => {
          const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
          return of(localSubmissions);
        })
      );
    } else {
      const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      return of(localSubmissions);
    }
  }

  updateSubmission(data: any): Observable<any> {
    if (this.isOnline()) {
      return this.http.put(this.apiUrl, data).pipe(
        catchError(error => {
          this.savePendingAction({ type: 'update', data });
          return of({ status: 'pending', message: 'Mise à jour enregistrée localement, synchronisation en attente.' });
        })
      );
    } else {
      this.savePendingAction({ type: 'update', data });
      return of({ status: 'pending', message: 'Pas de connexion, mise à jour enregistrée localement.' });
    }
  }

  deleteSubmission(id: number): Observable<any> {
    if (this.isOnline()) {
      return this.http.delete(this.apiUrl, { body: { id } }).pipe(
        catchError(error => {
          this.savePendingAction({ type: 'delete', data: { id } });
          return of({ status: 'pending', message: 'Suppression enregistrée localement, synchronisation en attente.' });
        })
      );
    } else {
      this.savePendingAction({ type: 'delete', data: { id } });
      return of({ status: 'pending', message: 'Pas de connexion, suppression enregistrée localement.' });
    }
  }
}
