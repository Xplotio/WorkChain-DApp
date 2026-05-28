import { Injectable } from '@angular/core';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = getApps().length
    ? getApps()[0]
    : initializeApp(environment.firebase);

  auth = getAuth(this.app);
  firestore = getFirestore(this.app);
}