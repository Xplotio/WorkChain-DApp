import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import {
  doc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

import { FirebaseService } from './firebase.service';

export type UserRole = 'client' | 'worker' | 'moderator' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebase = inject(FirebaseService);
  private readonly adminEmail = 'admin@workchain.local';
  private readonly adminPassword = 'Admin123456';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.firebase.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) {
    const credential = await createUserWithEmailAndPassword(
      this.firebase.auth,
      email,
      password
    );

    await this.saveUserDocument(
      credential.user.uid,
      name,
      email,
      role
    );

    return credential.user;
  }

  async login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(
      this.firebase.auth,
      email,
      password
    );

    return credential.user;
  }

  async loginAsAdmin() {
    try {
      const credential = await signInWithEmailAndPassword(
        this.firebase.auth,
        this.adminEmail,
        this.adminPassword
      );

      await this.saveUserDocument(
        credential.user.uid,
        'Admin WorkChain',
        this.adminEmail,
        'admin'
      );

      return credential.user;
    } catch (error: any) {
      const canCreateAdmin =
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential';

      if (!canCreateAdmin) {
        throw error;
      }

      const credential = await createUserWithEmailAndPassword(
        this.firebase.auth,
        this.adminEmail,
        this.adminPassword
      );

      await this.saveUserDocument(
        credential.user.uid,
        'Admin WorkChain',
        this.adminEmail,
        'admin'
      );

      return credential.user;
    }
  }

  async logout() {
    await signOut(this.firebase.auth);
  }

  private async saveUserDocument(
    uid: string,
    name: string,
    email: string,
    role: UserRole
  ) {
    await setDoc(
      doc(this.firebase.firestore, 'users', uid),
      {
        uid,
        name,
        email,
        role,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }
}
