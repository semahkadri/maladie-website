import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input('appScrollAnimate') animationType: string = 'fade-up';
  @Input() animateDelay: number = 0;
  @Input() animateThreshold: number = 0.15;

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const host = this.el.nativeElement;
    host.classList.add('scroll-animate', `scroll-animate--${this.animationType}`);
    if (this.animateDelay) {
      host.style.transitionDelay = `${this.animateDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animate--visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: this.animateThreshold }
    );

    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
