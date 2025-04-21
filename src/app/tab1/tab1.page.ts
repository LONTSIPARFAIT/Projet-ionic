import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';

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
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Initialisation du formulaire avec validations
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
    // Charger depuis localStorage
    this.loadSubmissions();
    // this.submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
  }

  async loadSubmissions() {
    this.isLoading = true;
    try {
      const response = await this.apiService.getSubmissions().toPromise();
      this.submissions = response; // Mettre à jour le tableau
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions :', error);
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Impossible de charger les soumissions.',
        buttons: ['OK']
      });
      await alert.present();
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

        // Recharger les soumissions
        await this.loadSubmissions();
        this.myForm.reset();
      } catch (error) {
        console.error('Erreur lors de l\'envoi :', error);
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
}
