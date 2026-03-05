import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Product Grid Skeleton -->
    <div *ngIf="type === 'product-grid'" class="fo-product-grid">
      <div *ngFor="let item of items" class="skeleton-card">
        <div class="skeleton-img skeleton-pulse"></div>
        <div style="padding: 16px;">
          <div class="skeleton-line skeleton-pulse" style="width: 40%; height: 10px; margin-bottom: 10px;"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 80%; height: 14px; margin-bottom: 8px;"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 95%; height: 10px; margin-bottom: 6px;"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 60%; height: 10px; margin-bottom: 16px;"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="skeleton-line skeleton-pulse" style="width: 30%; height: 16px;"></div>
            <div class="skeleton-line skeleton-pulse" style="width: 25%; height: 12px;"></div>
          </div>
          <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 38px; margin-top: 12px; border-radius: 8px;"></div>
        </div>
      </div>
    </div>

    <!-- Category Grid Skeleton -->
    <div *ngIf="type === 'category-grid'" class="fo-category-grid">
      <div *ngFor="let item of items" class="skeleton-card" style="text-align: center; padding: 32px 20px;">
        <div class="skeleton-circle skeleton-pulse" style="margin: 0 auto 16px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 60%; height: 16px; margin: 0 auto 8px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 80%; height: 10px; margin: 0 auto 6px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 50%; height: 10px; margin: 0 auto;"></div>
      </div>
    </div>

    <!-- Product Detail Skeleton -->
    <div *ngIf="type === 'product-detail'" class="fo-product-detail">
      <div class="skeleton-detail-img skeleton-pulse"></div>
      <div style="flex: 1;">
        <div class="skeleton-line skeleton-pulse" style="width: 25%; height: 12px; margin-bottom: 12px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 60%; height: 28px; margin-bottom: 16px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 12px; margin-bottom: 8px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 90%; height: 12px; margin-bottom: 8px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 75%; height: 12px; margin-bottom: 24px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 30%; height: 32px; margin-bottom: 12px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 40%; height: 14px; margin-bottom: 24px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 50%; height: 44px; border-radius: 10px;"></div>
      </div>
    </div>
  `
})
export class SkeletonLoaderComponent {
  @Input() type: 'product-grid' | 'category-grid' | 'product-detail' = 'product-grid';
  @Input() count: number = 6;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
