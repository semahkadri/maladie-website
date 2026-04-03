import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promo-countdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ─── CARD mode: full-width fire banner ─── -->
    <ng-container *ngIf="size === 'card' && dateFinPromo">
      <div *ngIf="!expired" class="pcd-card" [class.pcd-urgent]="urgent">
        <i class="bi bi-fire pcd-icon"></i>
        <span class="pcd-label-text">{{ isFr ? 'Expire dans' : 'Ends in' }}</span>
        <div class="pcd-blocks-row">
          <div class="pcd-unit-block">
            <span class="pcd-num">{{ pad(jours) }}</span>
            <span class="pcd-lbl">{{ isFr ? 'J' : 'D' }}</span>
          </div>
          <span class="pcd-colon">:</span>
          <div class="pcd-unit-block">
            <span class="pcd-num">{{ pad(heures) }}</span>
            <span class="pcd-lbl">H</span>
          </div>
          <span class="pcd-colon">:</span>
          <div class="pcd-unit-block">
            <span class="pcd-num">{{ pad(minutes) }}</span>
            <span class="pcd-lbl">M</span>
          </div>
          <span class="pcd-colon">:</span>
          <div class="pcd-unit-block">
            <span class="pcd-num">{{ pad(secondes) }}</span>
            <span class="pcd-lbl">S</span>
          </div>
        </div>
      </div>
      <div *ngIf="expired" class="pcd-card pcd-expired">
        <i class="bi bi-clock-history me-1"></i>
        {{ isFr ? 'Offre expirée' : 'Offer expired' }}
      </div>
    </ng-container>

    <!-- ─── DETAIL mode: large prominent countdown ─── -->
    <ng-container *ngIf="size === 'detail' && dateFinPromo">
      <div *ngIf="!expired" class="pcd-detail" [class.pcd-urgent]="urgent">
        <div class="pcd-detail-header">
          <i class="bi bi-lightning-charge-fill"></i>
          {{ isFr ? 'Offre limitée — Se termine dans :' : 'Limited offer — Ends in:' }}
        </div>
        <div class="pcd-detail-blocks">
          <div class="pcd-detail-block">
            <span class="pcd-detail-num">{{ pad(jours) }}</span>
            <span class="pcd-detail-lbl">{{ isFr ? 'Jours' : 'Days' }}</span>
          </div>
          <span class="pcd-detail-sep">:</span>
          <div class="pcd-detail-block">
            <span class="pcd-detail-num">{{ pad(heures) }}</span>
            <span class="pcd-detail-lbl">{{ isFr ? 'Heures' : 'Hours' }}</span>
          </div>
          <span class="pcd-detail-sep">:</span>
          <div class="pcd-detail-block">
            <span class="pcd-detail-num">{{ pad(minutes) }}</span>
            <span class="pcd-detail-lbl">Min</span>
          </div>
          <span class="pcd-detail-sep">:</span>
          <div class="pcd-detail-block">
            <span class="pcd-detail-num">{{ pad(secondes) }}</span>
            <span class="pcd-detail-lbl">Sec</span>
          </div>
        </div>
      </div>
      <div *ngIf="expired" class="pcd-detail pcd-expired">
        <i class="bi bi-clock-history me-2"></i>
        {{ isFr ? 'Cette offre a expiré' : 'This offer has expired' }}
      </div>
    </ng-container>
  `
})
export class PromoCountdownComponent implements OnInit, OnDestroy {
  @Input() dateFinPromo?: string;
  @Input() size: 'card' | 'detail' = 'card';
  @Input() isFr: boolean = true;

  jours = 0;
  heures = 0;
  minutes = 0;
  secondes = 0;
  expired = false;
  urgent = false;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (!this.dateFinPromo) return;
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    const diff = new Date(this.dateFinPromo!).getTime() - Date.now();

    if (diff <= 0) {
      this.expired = true;
      this.jours = this.heures = this.minutes = this.secondes = 0;
      if (this.intervalId) clearInterval(this.intervalId);
      return;
    }

    this.urgent = diff < 24 * 60 * 60 * 1000;
    this.jours    = Math.floor(diff / 86_400_000);
    this.heures   = Math.floor((diff % 86_400_000) / 3_600_000);
    this.minutes  = Math.floor((diff % 3_600_000)  /    60_000);
    this.secondes = Math.floor((diff %    60_000)  /     1_000);
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
