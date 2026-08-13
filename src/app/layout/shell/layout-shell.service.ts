import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutShellService {
  readonly desktopCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);

  toggleDesktopCollapsed(): void {
    this.desktopCollapsed.update((value) => !value);
  }

  openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((value) => !value);
  }
}
