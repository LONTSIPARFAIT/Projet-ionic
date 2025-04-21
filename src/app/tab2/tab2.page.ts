import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  chatForm!: FormGroup;
  messages: { text: string, sender: 'user' | 'bot', timestamp: string }[] = [];
  isLoading = false;

  // Réponses prédéfinies du bot
  private botResponses: { [key: string]: string } = {
    'salut': 'Miaou ! Je suis Grok, ton chat virtuel. 😺 Comment puis-je t’aider ?',
    'ça va': 'Super, merci ! Et toi, ça va ?',
    'soumissions': 'Laisse-moi vérifier... Il y a %SUBMISSIONS% soumissions dans l’app. Veux-tu plus de détails ?',
    'quiz': 'OK ! Quelle est la capitale de la France ? A) Paris B) Londres C) Tokyo',
    'paris': 'Bonne réponse ! 😺 Veux-tu une autre question ?',
    'default': 'Mmm, je ne suis qu’un petit chat, je n’ai pas compris. 😿 Essaie "salut", "soumissions", ou "quiz" !'
  };

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController
  ) {}

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
    }
  }

  clearChat() {
    this.messages = [];
    localStorage.removeItem('chatMessages');
  }
}