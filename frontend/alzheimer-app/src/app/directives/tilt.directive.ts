import { Directive, ElementRef, HostListener, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective implements OnInit, OnDestroy {
  @Input() tiltMax: number = 8;
  @Input() tiltScale: number = 1.02;

  private glare!: HTMLElement;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const host = this.el.nativeElement;
    host.style.transformStyle = 'preserve-3d';
    host.style.willChange = 'transform';

    // Create glare overlay
    this.glare = document.createElement('div');
    this.glare.style.cssText = `
      position: absolute; inset: 0; border-radius: inherit;
      pointer-events: none; opacity: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%);
      transition: opacity 0.3s ease;
      z-index: 2;
    `;
    host.style.position = host.style.position || 'relative';
    host.style.overflow = 'hidden';
    host.appendChild(this.glare);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * this.tiltMax * 2;
    const rotateX = (0.5 - y) * this.tiltMax * 2;

    host.style.transition = 'transform 0.1s ease-out';
    host.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${this.tiltScale}, ${this.tiltScale}, ${this.tiltScale})`;

    // Move glare
    const glareX = x * 100;
    const glareY = y * 100;
    this.glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)`;
    this.glare.style.opacity = '1';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const host = this.el.nativeElement;
    host.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    host.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    this.glare.style.opacity = '0';
  }

  ngOnDestroy(): void {
    if (this.glare && this.glare.parentNode) {
      this.glare.parentNode.removeChild(this.glare);
    }
  }
}
