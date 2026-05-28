import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private web3Service = inject(Web3Service);
  private router = inject(Router);
  private zone = inject(NgZone);
  private authSubscription?: Subscription;

  currentUser$ = this.authService.currentUser$;

  walletAddress = '';
  chainId = '';
  walletError = '';
  walletLoading = false;
  walletChecked = false;

  private readonly accountsChangedHandler = (accounts: string[]) => {
    this.zone.run(async () => {
      this.walletAddress = accounts[0] || '';

      if (this.walletAddress) {
        try {
          await this.web3Service.saveWalletToUser(this.walletAddress);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  private readonly chainChangedHandler = (chainId: string) => {
    this.zone.run(() => {
      this.chainId = chainId;
    });
  };

  ngOnInit() {
    this.web3Service.onAccountsChanged(this.accountsChangedHandler);
    this.web3Service.onChainChanged(this.chainChangedHandler);

    this.authSubscription = this.currentUser$.subscribe((user) => {
      if (user) {
        void this.loadWalletState();
      } else {
        this.walletAddress = '';
        this.chainId = '';
        this.walletChecked = true;
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.web3Service.removeAccountsChanged(this.accountsChangedHandler);
    this.web3Service.removeChainChanged(this.chainChangedHandler);
  }

  async loadWalletState() {
    this.walletError = '';
    this.walletLoading = true;

    try {
      const [savedWallet, connectedWallet, chainId] = await Promise.all([
        this.web3Service.getSavedWalletFromUser(),
        this.web3Service.hasMetaMask()
          ? this.web3Service.getConnectedWallet()
          : Promise.resolve(null),
        this.web3Service.getChainId()
      ]);

      this.walletAddress = connectedWallet || savedWallet;
      this.chainId = chainId || '';
    } catch (error: any) {
      this.walletError = error.message || 'No se pudo leer el estado de MetaMask.';
      console.error(error);
    } finally {
      this.walletLoading = false;
      this.walletChecked = true;
    }
  }

  async connectWallet() {
    this.walletError = '';

    try {
      this.walletLoading = true;
      this.walletAddress = await this.web3Service.connectAndSaveWallet();
      this.chainId = (await this.web3Service.getChainId()) || '';
    } catch (error: any) {
      this.walletError = error.message || 'No se pudo conectar MetaMask.';
      console.error(error);
    } finally {
      this.walletLoading = false;
      this.walletChecked = true;
    }
  }

  isAdmin(email: string | null): boolean {
    return email === 'admin@workchain.local';
  }

  getWalletButtonText(): string {
    if (this.walletLoading) {
      return 'Conectando...';
    }

    return this.walletAddress ? 'Cambiar wallet' : 'Conectar MetaMask';
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
