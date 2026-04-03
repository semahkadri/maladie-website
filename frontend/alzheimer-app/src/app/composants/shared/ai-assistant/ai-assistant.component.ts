import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AiService, ConversationMessage, AiChatResponse } from '../../../services/ai.service';
import { PanierService } from '../../../services/panier.service';
import { TraductionService } from '../../../services/traduction.service';
import { Produit } from '../../../modeles/produit.model';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  produits?: Produit[];
  timestamp: Date;
  typing?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  animations: [
    trigger('panelSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px) scale(0.97)' }),
        animate('350ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('220ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, transform: 'translateY(16px) scale(0.97)' }))
      ])
    ]),
    trigger('msgAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('280ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('productAnim', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-12px)' }),
          stagger(60, [animate('260ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <!-- Floating Trigger Button -->
    <div class="ai-fab-wrap">
      <button class="ai-fab" (click)="togglePanel()"
              [class.ai-fab-open]="isOpen"
              [title]="t.isFr ? 'Assistant IA PharmaCare' : 'PharmaCare AI Assistant'">
        <div class="ai-fab-rings">
          <span class="ai-fab-ring r1"></span>
          <span class="ai-fab-ring r2"></span>
        </div>
        <div class="ai-fab-icon">
          <i class="bi bi-robot" *ngIf="!isOpen"></i>
          <i class="bi bi-x-lg" *ngIf="isOpen"></i>
        </div>
        <span class="ai-fab-label">{{ t.isFr ? 'Assistant IA' : 'AI Assistant' }}</span>
      </button>
      <div class="ai-fab-badge" *ngIf="unreadCount > 0 && !isOpen">{{ unreadCount }}</div>
    </div>

    <!-- Chat Panel -->
    <div *ngIf="isOpen" class="ai-panel" [@panelSlide]>

      <!-- Header -->
      <div class="ai-panel-header">
        <div class="ai-panel-header-left">
          <div class="ai-panel-avatar">
            <i class="bi bi-robot"></i>
            <span class="ai-online-dot"></span>
          </div>
          <div>
            <div class="ai-panel-name">PharmaCare AI</div>
            <div class="ai-panel-status">
              <span class="ai-status-dot"></span>
              {{ t.isFr ? 'En ligne' : 'Online' }}
            </div>
          </div>
        </div>
        <div class="ai-panel-header-actions">
          <button class="ai-header-btn" (click)="clearConversation()" [title]="t.isFr ? 'Nouvelle conversation' : 'New conversation'">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="ai-header-btn ai-close-btn" (click)="isOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="ai-messages" #messagesContainer>

        <!-- Welcome message -->
        <div *ngIf="messages.length === 0" class="ai-welcome">
          <div class="ai-welcome-orb">
            <i class="bi bi-robot"></i>
          </div>
          <h4>{{ t.isFr ? 'Bonjour ! Je suis votre assistant pharmacien.' : 'Hello! I am your pharmacy assistant.' }}</h4>
          <p>{{ t.isFr
            ? 'Posez-moi vos questions sur nos produits, symptômes ou conseils santé.'
            : 'Ask me anything about our products, symptoms or health advice.' }}</p>

          <!-- Quick action chips -->
          <div class="ai-chips">
            <button *ngFor="let chip of quickChips" class="ai-chip" (click)="sendChip(chip.text)">
              <i class="bi me-1" [class]="chip.icon"></i>{{ t.isFr ? chip.labelFr : chip.labelEn }}
            </button>
          </div>
        </div>

        <!-- Chat messages -->
        <div *ngFor="let msg of messages" [@msgAnim]
             class="ai-msg-wrap" [class.ai-msg-user]="msg.role === 'user'" [class.ai-msg-ai]="msg.role === 'assistant'">

          <!-- AI avatar -->
          <div *ngIf="msg.role === 'assistant'" class="ai-msg-avatar">
            <i class="bi bi-robot"></i>
          </div>

          <div class="ai-msg-content">
            <!-- Typing indicator -->
            <div *ngIf="msg.typing" class="ai-msg-bubble ai-bubble-ai">
              <div class="ai-typing">
                <span></span><span></span><span></span>
              </div>
            </div>

            <!-- Regular message -->
            <div *ngIf="!msg.typing" class="ai-msg-bubble" [class.ai-bubble-ai]="msg.role === 'assistant'" [class.ai-bubble-user]="msg.role === 'user'">
              {{ msg.text }}
            </div>

            <!-- Suggested products -->
            <div *ngIf="msg.produits && msg.produits.length > 0" class="ai-products" [@productAnim]="msg.produits.length">
              <div class="ai-products-label">
                <i class="bi bi-bag-heart me-1"></i>
                {{ t.isFr ? 'Produits recommandés' : 'Recommended products' }}
              </div>
              <div *ngFor="let prod of msg.produits" class="ai-product-card">
                <div class="ai-product-img">
                  <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom">
                  <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
                </div>
                <div class="ai-product-info">
                  <div class="ai-product-name">{{ prod.nom }}</div>
                  <div class="ai-product-cat">{{ prod.categorieNom }}</div>
                  <div class="ai-product-price-row">
                    <span *ngIf="prod.enPromo && prod.prixOriginal" class="ai-product-orig">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="ai-product-price" [class.ai-promo-price]="prod.enPromo">{{ prod.prix | number:'1.2-2' }} TND</span>
                    <span *ngIf="prod.enPromo && prod.remise" class="ai-promo-tag">-{{ prod.remise }}%</span>
                  </div>
                </div>
                <div class="ai-product-actions">
                  <button class="ai-product-btn"
                          [class.ai-btn-success]="addedId === prod.id"
                          [disabled]="prod.quantite === 0 || addingId === prod.id"
                          (click)="addToCart(prod)">
                    <span *ngIf="addingId === prod.id" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="addingId !== prod.id && addedId !== prod.id" class="bi bi-cart-plus"></i>
                    <i *ngIf="addedId === prod.id" class="bi bi-check-lg"></i>
                  </button>
                  <a [routerLink]="['/catalogue', prod.id]" class="ai-product-link" (click)="isOpen = false">
                    <i class="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- Timestamp -->
            <div *ngIf="!msg.typing" class="ai-msg-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

      </div>

      <!-- Input Area -->
      <div class="ai-input-area">
        <div class="ai-input-wrap">
          <input #inputField
                 type="text"
                 class="ai-input"
                 [(ngModel)]="currentMessage"
                 [placeholder]="t.isFr ? 'Posez votre question...' : 'Ask your question...'"
                 (keyup.enter)="sendMessage()"
                 [disabled]="isLoading"
                 maxlength="500">
          <button class="ai-send-btn" (click)="sendMessage()" [disabled]="!currentMessage.trim() || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isLoading" class="bi bi-send-fill"></i>
          </button>
        </div>
        <div class="ai-input-footer">
          <i class="bi bi-shield-check me-1"></i>
          {{ t.isFr ? 'Toujours consulter un professionnel de santé.' : 'Always consult a healthcare professional.' }}
        </div>
      </div>

    </div>
  `
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  isOpen = false;
  isLoading = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  conversationHistory: ConversationMessage[] = [];
  unreadCount = 0;
  addingId: number | null = null;
  addedId: number | null = null;
  private shouldScroll = false;

  quickChips = [
    { icon: 'bi-thermometer-half', labelFr: 'Médicaments fièvre', labelEn: 'Fever medicine', text: 'Quels médicaments avez-vous contre la fièvre ?' },
    { icon: 'bi-heart-pulse', labelFr: 'Vitamines & compléments', labelEn: 'Vitamins & supplements', text: 'Quels compléments alimentaires recommandez-vous ?' },
    { icon: 'bi-fire', labelFr: 'Produits en promo', labelEn: 'Products on sale', text: 'Quels produits sont en promotion ?' },
    { icon: 'bi-bandaid', labelFr: 'Soins de la peau', labelEn: 'Skin care', text: 'Quels produits avez-vous pour les soins de la peau ?' },
    { icon: 'bi-moon-stars', labelFr: 'Troubles du sommeil', labelEn: 'Sleep problems', text: 'Avez-vous quelque chose pour mieux dormir ?' },
    { icon: 'bi-emoji-smile', labelFr: 'Moins cher', labelEn: 'Most affordable', text: 'Quels sont vos produits les moins chers ?' }
  ];

  constructor(
    public t: TraductionService,
    private aiService: AiService,
    private panierService: PanierService
  ) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.inputField?.nativeElement?.focus(), 350);
    }
  }

  sendChip(text: string): void {
    this.currentMessage = text;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.currentMessage.trim();
    if (!text || this.isLoading) return;

    // Add user message
    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.conversationHistory.push({ role: 'user', contenu: text });
    this.currentMessage = '';
    this.shouldScroll = true;

    // Add typing indicator
    const typingMsg: ChatMessage = { role: 'assistant', text: '', timestamp: new Date(), typing: true };
    this.messages.push(typingMsg);
    this.isLoading = true;
    this.shouldScroll = true;

    this.aiService.chat(text, this.conversationHistory.slice(-8), this.t.isFr ? 'fr' : 'en').subscribe({
      next: (res: AiChatResponse) => {
        // Replace typing with real message
        const idx = this.messages.indexOf(typingMsg);
        if (idx >= 0) {
          this.messages[idx] = {
            role: 'assistant',
            text: res.reponse,
            produits: res.produitsSugeres,
            timestamp: new Date()
          };
        }
        this.conversationHistory.push({ role: 'assistant', contenu: res.reponse });
        this.isLoading = false;
        if (!this.isOpen) this.unreadCount++;
        this.shouldScroll = true;
      },
      error: () => {
        const idx = this.messages.indexOf(typingMsg);
        if (idx >= 0) {
          this.messages[idx] = {
            role: 'assistant',
            text: this.t.isFr ? 'Désolé, je suis temporairement indisponible. Veuillez réessayer.' : 'Sorry, I am temporarily unavailable. Please try again.',
            timestamp: new Date()
          };
        }
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  clearConversation(): void {
    this.messages = [];
    this.conversationHistory = [];
  }

  addToCart(prod: Produit): void {
    if (!prod.id) return;
    this.addingId = prod.id;
    this.panierService.ajouterProduit(prod.id, 1).subscribe({
      next: () => {
        this.addingId = null;
        this.addedId = prod.id!;
        setTimeout(() => this.addedId = null, 2000);
      },
      error: () => { this.addingId = null; }
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString(this.t.locale, { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
