import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private web3Service = inject(Web3Service);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;

  walletAddress = '';
  walletError = '';
  walletLoading = false;

  async connectWallet() {
    this.walletError = '';

    try {
      this.walletLoading = true;
      this.walletAddress = await this.web3Service.connectAndSaveWallet();
    } catch (error: any) {
      this.walletError = error.message || 'No se pudo conectar MetaMask.';
      console.error(error);
    } finally {
      this.walletLoading = false;
    }
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}