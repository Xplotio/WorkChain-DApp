import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  async login() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Ingresa tu correo y contrasena.';
      return;
    }

    try {
      this.loading = true;
      await this.authService.login(this.email, this.password);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Correo o contrasena incorrectos.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async enterAsAdmin() {
    this.errorMessage = '';

    try {
      this.loading = true;
      await this.authService.loginAsAdmin();
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage =
        error.message || 'No se pudo entrar como admin.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
