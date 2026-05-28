import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FeaturedProject {
  title: string;
  category: string;
  budget: string;
  milestones: string;
  description: string;
  tags: string[];
}

interface PopularService {
  title: string;
  description: string;
  fromPrice: string;
  accent: string;
}

interface CategoryStat {
  title: string;
  description: string;
  activeProjects: string;
}

interface WorkflowStep {
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  searchTerm = '';

  readonly projects: FeaturedProject[] = [
    {
      title: 'DApp para control de inventario',
      category: 'Desarrollo web',
      budget: '$12,000 MXN',
      milestones: '3 hitos',
      description:
        'Cliente busca dashboard Angular con login, Firestore y pagos por avance verificado.',
      tags: ['Angular', 'Firebase', 'Solidity']
    },
    {
      title: 'Planos y render para remodelacion',
      category: 'Arquitectura',
      budget: '$8,500 MXN',
      milestones: '2 hitos',
      description:
        'Entrega de propuesta visual, planos base y render final con evidencia por archivo.',
      tags: ['BIM', 'Render', 'Planos']
    },
    {
      title: 'Contrato digital para SaaS',
      category: 'Legal',
      budget: '$5,200 MXN',
      milestones: '2 hitos',
      description:
        'Revision de terminos, NDA y clausulas para pagos por servicios profesionales.',
      tags: ['Contratos', 'NDA', 'Compliance']
    }
  ];

  readonly services: PopularService[] = [
    {
      title: 'Desarrollo web',
      description: 'Landing pages, dashboards, DApps y sistemas con Firebase.',
      fromPrice: 'Desde $1,800',
      accent: 'Web'
    },
    {
      title: 'Edicion de video',
      description: 'Videos para redes, presentaciones, reels y contenido comercial.',
      fromPrice: 'Desde $900',
      accent: 'Video'
    },
    {
      title: 'Arquitectura',
      description: 'Planos, modelado 3D, renders y revisiones por entregables.',
      fromPrice: 'Desde $2,500',
      accent: '3D'
    },
    {
      title: 'Diseno grafico',
      description: 'Identidad visual, piezas para redes, banners y presentaciones.',
      fromPrice: 'Desde $750',
      accent: 'Brand'
    },
    {
      title: 'Asesoria legal',
      description: 'Contratos, privacidad, propiedad intelectual y documentos.',
      fromPrice: 'Desde $1,200',
      accent: 'Legal'
    },
    {
      title: 'Smart contracts',
      description: 'Escrow, pagos por hitos, evidencias y despliegues Hardhat.',
      fromPrice: 'Desde $3,500',
      accent: 'Web3'
    }
  ];

  readonly categories: CategoryStat[] = [
    {
      title: 'Programacion',
      description: 'Frontend, backend, DApps, automatizacion y soporte tecnico.',
      activeProjects: '42 proyectos'
    },
    {
      title: 'Diseno y video',
      description: 'Branding, piezas para redes, edicion, motion y presentaciones.',
      activeProjects: '31 proyectos'
    },
    {
      title: 'Arquitectura',
      description: 'Planos, renders, interiorismo, modelado BIM y presupuestos.',
      activeProjects: '18 proyectos'
    },
    {
      title: 'Legal',
      description: 'Contratos, privacidad, propiedad intelectual y documentos.',
      activeProjects: '15 proyectos'
    }
  ];

  readonly clientSteps: WorkflowStep[] = [
    {
      title: 'Publica lo que necesitas',
      description:
        'Define alcance, presupuesto, fechas y entregables para recibir propuestas claras.'
    },
    {
      title: 'Deposita al escrow',
      description:
        'El pago va al smart contract y queda retenido hasta que apruebes los hitos.'
    },
    {
      title: 'Aprueba avances',
      description:
        'Revisa evidencias, documentos o CIDs y libera pagos al freelancer por hito.'
    }
  ];

  readonly workerSteps: WorkflowStep[] = [
    {
      title: 'Crea tu perfil',
      description:
        'Agrega profesion, habilidades, wallet y CV con hash SHA-256 verificable.'
    },
    {
      title: 'Postulate a proyectos',
      description:
        'Elige trabajos por categoria y acuerda hitos con importes definidos.'
    },
    {
      title: 'Entrega evidencia',
      description:
        'Sube enlaces, CIDs IPFS o documentos verificables para solicitar aprobacion.'
    }
  ];
}
