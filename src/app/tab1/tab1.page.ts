import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  myForm!: FormGroup; // Ajoute ! pour indiquer que myForm sera assigné

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Initialisation du formulaire avec validations
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }
  // // Méthode pour vérifier si un champ est valide
  // isFieldValid(field: string) {
  //   return !this.myForm.get(field)?.valid && this.myForm.get(field)?.touched;
  // }
  // // Méthode pour obtenir le message d'erreur d'un champ
  // getErrorMessage(field: string) {
  //   if (this.myForm.get(field)?.hasError('required')) {
  //     return 'Ce champ est requis';
  //   } else if (this.myForm.get(field)?.hasError('minlength')) {
  //     return 'Le nom doit contenir au moins 3 caractères';
  //   } else if (this.myForm.get(field)?.hasError('email')) {
  //     return 'Adresse e-mail invalide';
  //   }
  //   return '';
  // }
  // Méthode pour soumettre le formulaire
    onSubmit() {
      if (this.myForm.valid) {
        console.log('Formulaire soumis :', this.myForm.value);
        // Ici, tu peux envoyer les données à une API ou les traiter
        alert('Formulaire envoyé avec succès !');
        this.myForm.reset(); // Réinitialiser le formulaire après soumission
      }
  }
}
