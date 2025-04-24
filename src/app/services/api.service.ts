import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/contact_api/index.php';

  constructor(private http: HttpClient) {}

  submitForm(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getSubmissions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateSubmission(data: any): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  deleteSubmission(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { id } });
  }
}
