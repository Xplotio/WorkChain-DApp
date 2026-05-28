import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  role: UserRole = 'client';

  loading = false;
  errorMessage = '';

  async register() {
    this.errorMessage = '';

    if (!this.name || !this.email || !this.password || !this.role) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener mínimo 6 caracteres.';
      return;
    }

    try {
      this.loading = true;

      await this.authService.register(
        this.name,
        this.email,
        this.password,
        this.role
      );

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'No se pudo crear la cuenta. Revisa los datos.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}