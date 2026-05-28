import { Injectable, inject } from '@angular/core';

import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private firebase = inject(FirebaseService);

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado.');
    }

    const accounts: string[] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No se pudo obtener la cuenta de MetaMask.');
    }

    return accounts[0];
  }

  async saveWalletToUser(walletAddress: string) {
    const currentUser = this.firebase.auth.currentUser;

    if (!currentUser) {
      throw new Error('No hay usuario autenticado.');
    }

    const userRef = doc(this.firebase.firestore, 'users', currentUser.uid);

    await updateDoc(userRef, {
      walletAddress
    });
  }

  async connectAndSaveWallet(): Promise<string> {
    const walletAddress = await this.connectWallet();
    await this.saveWalletToUser(walletAddress);

    return walletAddress;
  }
}