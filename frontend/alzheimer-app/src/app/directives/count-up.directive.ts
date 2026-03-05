import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('appCountUp') target: number = 0;
  @Input() countDuration: number = 2000;
  @Input() countSuffix: string = '';

  private observer!: IntersectionObserver;
  private animationId: number = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const host = this.el.nativeElement;
    host.textContent = '0' + this.countSuffix;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    this.observer.observe(host);
  }

  private animate(): void {
    const start = performance.now();
    const duration = this.countDuration;
    const target = this.target;
    const host = this.el.nativeElement;
    const suffix = this.countSuffix;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      host.textContent = current + suffix;

      if (progress < 1) {
        this.animationId = requestAnimationFrame(step);
      }
    };

    this.animationId = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
