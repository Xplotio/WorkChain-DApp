import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Profession,
  WorkerService
} from '../../services/worker.service';

@Component({
  selector: 'app-worker-profile',
  imports: [FormsModule, RouterLink],
  templateUrl: './worker-profile.html',
  styleUrl: './worker-profile.scss'
})
export class WorkerProfileComponent implements OnInit {
  private workerService = inject(WorkerService);
  private readonly maxCvSizeBytes = 5 * 1024 * 1024;

  profession: Profession = 'programmer';
  title = '';
  description = '';
  skillsText = '';
  cvUrl = '';
  cvHash = '';
  cvFileName = '';
  cvFileSize = 0;
  basePrice = 0;
  available = true;

  loading = false;
  successMessage = '';
  errorMessage = '';

  async ngOnInit() {
    try {
      const profile = await this.workerService.getMyProfile();

      if (profile) {
        this.profession = profile.profession;
        this.title = profile.title;
        this.description = profile.description;
        this.skillsText = profile.skills?.join(', ') || '';
        this.cvUrl = profile.cvUrl || '';
        this.cvHash = profile.cvHash || '';
        this.cvFileName = profile.cvFileName || '';
        this.cvFileSize = profile.cvFileSize || 0;
        this.basePrice = profile.basePrice;
        this.available = profile.available;
      }
    } catch (error) {
      console.error(error);
      this.errorMessage = 'No se pudo cargar tu perfil.';
    } finally {
      this.loading = false;
    }
  }

  async onCvSelected(event: Event) {
    this.successMessage = '';
    this.errorMessage = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      this.clearCvSelection(input);
      this.errorMessage = 'Selecciona un archivo PDF valido.';
      return;
    }

    if (file.size > this.maxCvSizeBytes) {
      this.clearCvSelection(input);
      this.errorMessage = 'El CV debe pesar maximo 5 MB.';
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);

      this.cvHash = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      this.cvFileName = file.name;
      this.cvFileSize = file.size;
    } catch (error: any) {
      this.clearCvSelection(input);
      this.errorMessage =
        error.message || 'No se pudo generar el hash del CV.';
      console.error(error);
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) {
      return '';
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  async saveProfile() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.title || !this.description || !this.skillsText) {
      this.errorMessage = 'Completa titulo, descripcion y habilidades.';
      return;
    }

    try {
      this.loading = true;

      const skills = this.skillsText
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      await this.workerService.saveMyProfile({
        profession: this.profession,
        title: this.title,
        description: this.description,
        skills,
        cvHash: this.cvHash,
        cvFileName: this.cvFileName,
        cvFileSize: this.cvFileSize,
        cvUrl: this.cvUrl.trim(),
        basePrice: Number(this.basePrice),
        available: this.available
      });

      this.successMessage = 'Perfil guardado correctamente.';
    } catch (error: any) {
      this.errorMessage =
        error.message || 'No se pudo guardar el perfil.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  private clearCvSelection(input: HTMLInputElement) {
    input.value = '';
    this.cvHash = '';
    this.cvFileName = '';
    this.cvFileSize = 0;
  }
}
