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

  profession: Profession = 'programmer';
  title = '';
  description = '';
  skillsText = '';
  portfolioUrl = '';
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
        this.skillsText = profile.skills.join(', ');
        this.portfolioUrl = profile.portfolioUrl;
        this.basePrice = profile.basePrice;
        this.available = profile.available;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async saveProfile() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.title || !this.description || !this.skillsText) {
      this.errorMessage = 'Completa título, descripción y habilidades.';
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
        portfolioUrl: this.portfolioUrl,
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
}