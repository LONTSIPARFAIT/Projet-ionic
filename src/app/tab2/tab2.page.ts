import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class Tab2Page implements OnInit {
  chatForm!: FormGroup;
  messages: { text: string; sender: 'user' | 'bot'; timestamp: string }[] = [];
  isLoading = false;

  // Réponses prédéfinies du bot
  private botResponses: { [key: string]: string } = {
    salut: 'Miaou ! Je suis Perfecto, ton chat virtuel. 😺 Comment puis-je t’aider ?',
    'ça va': 'Super, merci ! Et toi, ça va ?',
    soumissions: 'Laisse-moi vérifier... Il y a %SUBMISSIONS% soumissions dans l’app. Veux-tu plus de détails ?',
    quiz: 'OK ! Question 1 : Quelle est la capitale de la France ? A) Paris B) Londres C) Tokyo',
    paris: 'Bonne réponse ! 😺 Question 2 : Quel est le langage principal d’Angular ? A) JavaScript B) TypeScript C) Python',
    typescript: 'Correct ! 🎉 Veux-tu une autre question ?',
    oui:'Ok cool ! 😺 Quelle est la capitale du Japon ? A) Bruxelle B) Caire C) Tokyo ?',
    Tokyo:'Bonne réponse ! 😺 Veux-tu une autre question ?',
    default: 'Mmm, je ne suis qu’un petit chat, je n’ai pas compris. 😿 Essaie "salut", "soumissions", ou "quiz" !'
  };

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController
  ) {}

  toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'true' : 'false');
  }
  
  ngOnInit() {
    // Initialiser le formulaire
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });

    // Charger l’historique des messages depuis localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }
  }

  async sendMessage() {
    if (this.chatForm.valid) {
      const userMessage = this.chatForm.value.message.toLowerCase().trim();
      const timestamp = new Date().toLocaleTimeString();

      // Ajouter le message de l’utilisateur
      this.messages.push({ text: userMessage, sender: 'user', timestamp });
      this.chatForm.reset();

      // Simuler une réponse du bot
      this.isLoading = true;
      setTimeout(async () => {
        let botReply = this.botResponses['default'];
        if (userMessage.includes('salut')) botReply = this.botResponses['salut'];
        else if (userMessage.includes('ça va')) botReply = this.botResponses['ça va'];
        else if (userMessage.includes('soumissions')) {
          const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
          botReply = this.botResponses['soumissions'].replace('%SUBMISSIONS%', submissions.length);
        } else if (userMessage.includes('quiz')) botReply = this.botResponses['quiz'];
        else if (userMessage.includes('paris')) botReply = this.botResponses['paris'];

        this.messages.push({ text: botReply, sender: 'bot', timestamp });
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
        this.isLoading = false;

        // Faire défiler vers le bas
        setTimeout(() => {
          const chatContainer = document.querySelector('.chat-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      }, 1000); // Simuler un délai de réponse
    } else {
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Veuillez entrer un message.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async clearChat() {
    const alert = await this.alertController.create({
      header: 'Confirmer',
      message: 'Voulez-vous vraiment effacer l’historique du chat ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Effacer',
          handler: () => {
            this.messages = [];
            localStorage.removeItem('chatMessages');
          }
        }
      ]
    });
    await alert.present();
  }
}