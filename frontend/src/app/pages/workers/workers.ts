import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Profession,
  WorkerProfile,
  WorkerService
} from '../../services/worker.service';

@Component({
  selector: 'app-workers',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './workers.html',
  styleUrl: './workers.scss'
})
export class WorkersComponent implements OnInit {
  private workerService = inject(WorkerService);

  workers: WorkerProfile[] = [];
  filteredWorkers: WorkerProfile[] = [];

  selectedProfession: Profession | 'all' = 'all';

  loading = false;
  errorMessage = '';

  async ngOnInit() {
    await this.loadWorkers();
  }

  async loadWorkers() {
    this.errorMessage = '';

    try {
      this.loading = true;
      this.workers = await this.workerService.getAvailableWorkers();
      this.applyFilter();
    } catch (error: any) {
      this.errorMessage =
        error.message || 'No se pudieron cargar los trabajadores.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  applyFilter() {
    if (this.selectedProfession === 'all') {
      this.filteredWorkers = this.workers;
      return;
    }

    this.filteredWorkers = this.workers.filter(
      (worker) => worker.profession === this.selectedProfession
    );
  }

  getProfessionLabel(profession: Profession): string {
    const labels: Record<Profession, string> = {
      programmer: 'Programador',
      architect: 'Arquitecto',
      graphic_designer: 'Diseñador gráfico',
      lawyer: 'Abogado'
    };

    return labels[profession];
  }
}