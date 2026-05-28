import { Injectable, inject } from '@angular/core';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private firebase = inject(FirebaseService);

  hasMetaMask(): boolean {
    return !!window.ethereum?.isMetaMask;
  }

  async getConnectedWallet(): Promise<string | null> {
    this.ensureMetaMask();

    const accounts = await this.requestWithTimeout<string[]>(
      'eth_accounts',
      12000
    );

    return accounts?.[0] || null;
  }

  async connectWallet(): Promise<string> {
    this.ensureMetaMask();

    try {
      const accounts = await this.requestWithTimeout<string[]>(
        'eth_requestAccounts',
        60000
      );

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la cuenta de MetaMask.');
      }

      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Solicitud rechazada en MetaMask.');
      }

      if (error.code === -32002) {
        throw new Error('MetaMask ya tiene una solicitud pendiente. Abre la extension y aceptala.');
      }

      throw error;
    }
  }

  async getChainId(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }

    return window.ethereum.request({ method: 'eth_chainId' });
  }

  async getSavedWalletFromUser(): Promise<string> {
    const currentUser = this.firebase.auth.currentUser;

    if (!currentUser) {
      return '';
    }

    const userRef = doc(this.firebase.firestore, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? userSnap.data()['walletAddress'] || '' : '';
  }

  async saveWalletToUser(walletAddress: string) {
    const currentUser = this.firebase.auth.currentUser;

    if (!currentUser) {
      throw new Error('No hay usuario autenticado.');
    }

    const userRef = doc(this.firebase.firestore, 'users', currentUser.uid);

    await setDoc(userRef, { walletAddress }, { merge: true });
  }

  async connectAndSaveWallet(): Promise<string> {
    const walletAddress = await this.connectWallet();
    await this.saveWalletToUser(walletAddress);

    return walletAddress;
  }

  onAccountsChanged(handler: (accounts: string[]) => void) {
    window.ethereum?.on?.('accountsChanged', handler);
  }

  onChainChanged(handler: (chainId: string) => void) {
    window.ethereum?.on?.('chainChanged', handler);
  }

  removeAccountsChanged(handler: (accounts: string[]) => void) {
    window.ethereum?.removeListener?.('accountsChanged', handler);
  }

  removeChainChanged(handler: (chainId: string) => void) {
    window.ethereum?.removeListener?.('chainChanged', handler);
  }

  private ensureMetaMask() {
    if (!window.ethereum) {
      throw new Error('MetaMask no esta instalado o no esta disponible en este navegador.');
    }

    if (!window.ethereum.isMetaMask) {
      throw new Error('Hay una wallet inyectada, pero no parece ser MetaMask.');
    }
  }

  private requestWithTimeout<T>(
    method: string,
    timeoutMs: number,
    params?: unknown[]
  ): Promise<T> {
    const request = window.ethereum!.request({ method, params }) as Promise<T>;
    const timeout = new Promise<T>((_, reject) => {
      window.setTimeout(
        () => reject(new Error('MetaMask no respondio. Revisa si la ventana de la extension esta abierta.')),
        timeoutMs
      );
    });

    return Promise.race([request, timeout]);
  }
}
