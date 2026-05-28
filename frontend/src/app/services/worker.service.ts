import { Injectable, inject } from '@angular/core';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';

import { FirebaseService } from './firebase.service';

export type Profession =
  | 'programmer'
  | 'architect'
  | 'graphic_designer'
  | 'lawyer';

export interface WorkerProfile {
  uid: string;
  name: string;
  email: string;
  walletAddress: string;
  profession: Profession;
  title: string;
  description: string;
  skills: string[];
  cvHash: string;
  cvFileName: string;
  cvFileSize: number;
  cvUrl: string;
  basePrice: number;
  available: boolean;
  createdAt?: any;
  updatedAt?: any;
}

type WorkerProfileData = Pick<
  WorkerProfile,
  | 'profession'
  | 'title'
  | 'description'
  | 'skills'
  | 'cvHash'
  | 'cvFileName'
  | 'cvFileSize'
  | 'cvUrl'
  | 'basePrice'
  | 'available'
>;

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private firebase = inject(FirebaseService);

  async saveMyProfile(profileData: WorkerProfileData) {
    const currentUser = this.firebase.auth.currentUser;

    if (!currentUser) {
      throw new Error('No hay usuario autenticado.');
    }

    const userRef = doc(this.firebase.firestore, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('No existe el documento del usuario en Firestore.');
    }

    const userData = userSnap.data();

    const profileRef = doc(
      this.firebase.firestore,
      'worker_profiles',
      currentUser.uid
    );

    const existingProfile = await getDoc(profileRef);

    const profile: WorkerProfile = {
      uid: currentUser.uid,
      name: userData['name'] || currentUser.displayName || '',
      email: userData['email'] || currentUser.email || '',
      walletAddress: userData['walletAddress'] || '',
      profession: profileData.profession,
      title: profileData.title,
      description: profileData.description,
      skills: profileData.skills,
      cvHash: profileData.cvHash,
      cvFileName: profileData.cvFileName,
      cvFileSize: profileData.cvFileSize,
      cvUrl: profileData.cvUrl,
      basePrice: profileData.basePrice,
      available: profileData.available,
      createdAt: existingProfile.exists()
        ? existingProfile.data()['createdAt']
        : serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(profileRef, profile, { merge: true });

    return profile;
  }

  async getMyProfile(): Promise<WorkerProfile | null> {
    const currentUser = this.firebase.auth.currentUser;

    if (!currentUser) {
      return null;
    }

    const profileRef = doc(
      this.firebase.firestore,
      'worker_profiles',
      currentUser.uid
    );

    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    return profileSnap.data() as WorkerProfile;
  }

  async getAvailableWorkers(): Promise<WorkerProfile[]> {
    const profilesRef = collection(this.firebase.firestore, 'worker_profiles');
    const q = query(profilesRef, where('available', '==', true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => docItem.data() as WorkerProfile);
  }
}
