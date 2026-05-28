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
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import { FirebaseService } from './firebase.service';

export type UserRole = 'client' | 'worker' | 'moderator';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebase = inject(FirebaseService);

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

    const uid = credential.user.uid;

    await setDoc(doc(this.firebase.firestore, 'users', uid), {
      uid,
      name,
      email,
      role,
      walletAddress: '',
      createdAt: serverTimestamp()
    });

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

  async logout() {
    await signOut(this.firebase.auth);
  }
}