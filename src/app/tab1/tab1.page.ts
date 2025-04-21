import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  myForm!: FormGroup; // Ajoute ! pour indiquer que myForm sera assigné
  submissions: any[] = []; // Tableau pour stocker les soumissions
  isLoading = false; // Ajouter cette propriété
  editForm!: FormGroup;
  selectedSubmission: any = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Initialisation du formulaire avec validations
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });

    // Initialiser le formulaire d’édition
    this.editForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
    // Charger les soumissions
    this.loadSubmissions();
    // Charger depuis localStorage
    // this.submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
  }

  async loadSubmissions() {
    this.isLoading = true;
    try {
      const response = await this.apiService.getSubmissions().toPromise();
      this.submissions = response;
      localStorage.setItem('submissions', JSON.stringify(response)); // Sauvegarder dans localStorage
    } catch (error) {
      console.error('Erreur API, chargement depuis localStorage :', error);
      const cachedSubmissions = localStorage.getItem('submissions');
      if (cachedSubmissions) {
        this.submissions = JSON.parse(cachedSubmissions);
        const alert = await this.alertController.create({
          header: 'Information',
          message: 'API indisponible. Données chargées depuis le cache local.',
          buttons: ['OK']
        });
        await alert.present();
      } else {
        this.submissions = [];
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger les soumissions. Aucun cache local disponible.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Méthode pour vérifier si un champ est valide
  isFieldValid(field: string) {
    return !this.myForm.get(field)?.valid && this.myForm.get(field)?.touched;
  }
  // Méthode pour obtenir le message d'erreur d'un champ
  getErrorMessage(field: string) {
    if (this.myForm.get(field)?.hasError('required')) {
      return 'Ce champ est requis';
    } else if (this.myForm.get(field)?.hasError('minlength')) {
      return 'Le nom doit contenir au moins 3 caractères';
    } else if (this.myForm.get(field)?.hasError('email')) {
      return 'Adresse e-mail invalide';
    }
    return '';
  }

  async onSubmit() {
    if (this.myForm.valid) {
      this.isLoading = true;
      try {
        await this.apiService.submitForm(this.myForm.value).toPromise();
        const alert = await this.alertController.create({
          header: 'Succès',
          message: 'Formulaire envoyé avec succès !',
          buttons: ['OK']
        });
        await alert.present();
        await this.loadSubmissions(); // Recharger pour synchroniser localStorage
        this.myForm.reset();
      } catch (error) {
        console.error('Erreur lors de l\'envoi :', error);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Une erreur est survenue. Réessayez.',
          buttons: ['OK']
        });
        await alert.present();
        // Ajouter localement si l’API échoue (optionnel)
        const newSubmission = { ...this.myForm.value, id: Date.now() }; // ID temporaire
        this.submissions.push(newSubmission);
        localStorage.setItem('submissions', JSON.stringify(this.submissions));
        const cacheAlert = await this.alertController.create({
          header: 'Information',
          message: 'Soumission enregistrée localement en attendant la connexion à l’API.',
          buttons: ['OK']
        });
        await cacheAlert.present();
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Méthode pour soumettre le formulaire
  //   onSubmit() {
  //     if (this.myForm.valid) {
  //       // Ajouter la soumission au tableau
  //       this.submissions.push(this.myForm.value);
  //       console.log('Soumissions :', this.submissions);

  //       // Sauvegarder dans localStorage
  //       localStorage.setItem('submissions', JSON.stringify(this.submissions));
  //       alert('Formulaire soumis avec succès !');
  //       this.myForm.reset(); // Réinitialiser le formulaire
  //     } else {
  //       alert('Veuillez remplir tous les champs correctement.');
  //     }
  // }

  async openEditModal(submission: any) {
    this.selectedSubmission = submission;
    this.editForm.patchValue({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      message: submission.message
    });

    const modal = await this.modalController.create({
      component: EditSubmissionModalComponent,
      componentProps: {
        editForm: this.editForm
      }
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data && result.data.submit) {
        this.isLoading = true;
        try {
          await this.apiService.updateSubmission(this.editForm.value).toPromise();
          const alert = await this.alertController.create({
            header: 'Succès',
            message: 'Soumission modifiée avec succès !',
            buttons: ['OK']
          });
          await alert.present();
          await this.loadSubmissions();
        } catch (error) {
          console.error('Erreur lors de la modification :', error);
          const alert = await this.alertController.create({
            header: 'Erreur',
            message: 'Une erreur est survenue. Réessayez.',
            buttons: ['OK']
          });
          await alert.present();
        } finally {
          this.isLoading = false;
        }
      }
    });

    await modal.present();
  }

  async deleteSubmission(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer cette soumission ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          handler: async () => {
            this.isLoading = true;
            try {
              await this.apiService.deleteSubmission(id).toPromise();
              const successAlert = await this.alertController.create({
                header: 'Succès',
                message: 'Soumission supprimée avec succès !',
                buttons: ['OK']
              });
              await successAlert.present();
              await this.loadSubmissions();
            } catch (error) {
              console.error('Erreur lors de la suppression :', error);
              const errorAlert = await this.alertController.create({
                header: 'Erreur',
                message: 'Une erreur est survenue. Réessayez.',
                buttons: ['OK']
              });
              await errorAlert.present();
            } finally {
              this.isLoading = false;
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

// Composant pour la modale d’édition (à créer séparément)
@Component({
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Modifier la soumission</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Annuler</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="editForm" (ngSubmit)="submitEdit()">
        <ion-item>
          <ion-label position="floating">Nom</ion-label>
          <ion-input formControlName="name" type="text"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="editForm.get('name')?.invalid && editForm.get('name')?.touched">
          Le nom est requis (minimum 3 caractères).
        </ion-text>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input formControlName="email" type="email"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="editForm.get('email')?.invalid && editForm.get('email')?.touched">
          Veuillez entrer un email valide.
        </ion-text>

        <ion-item>
          <ion-label position="floating">Message</ion-label>
          <ion-textarea formControlName="message" rows="4"></ion-textarea>
        </ion-item>
        <ion-text color="danger" *ngIf="editForm.get('message')?.invalid && editForm.get('message')?.touched">
          Le message est requis.
        </ion-text>

        <ion-button type="submit" expand="block" color="primary" [disabled]="editForm.invalid">
          Enregistrer
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})

export class EditSubmissionModalComponent {
  editForm!: FormGroup;

  constructor(private modalController: ModalController) {}

  submitEdit() {
    if (this.editForm.valid) {
      this.modalController.dismiss({ submit: true });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
