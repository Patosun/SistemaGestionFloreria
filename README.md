# Sistema de gestion de floreria

Grupo: Rancho de broken

Rubro: 1 (comercio y retail)

- Apaza Choque Jose Ariel 
- Chacolla Aduviri Evan Leonel
- Marin Cardozo Carlos
- Villca Flores  Samuel Hernry
- Fabiani Cortes Rafael Alejandro

## Stack Tecnologico

#### Frontend 

Next 16.2, React server components, Typescript

#### UI/UX

TailwindCSS, Shadcn (RadixUI), Framer motion (Libreria para animaciones)

#### Backend

Next.js API routes + Server actions, Better Auth (Autenticacion moderna con RBAC), Zustand, TanStack

#### Base de datos

PostgreSQL, Prisma ORM, NEON (Plataforma serverless para base de datos)

#### Arquitectura del sistema:
El sistema usa una arquitectura híbrida monolítica construida sobre Next.js 16 (App Router) con React Server Components como paradigma principal. Es una aplicación full-stack TypeScript donde el frontend y backend conviven en un mismo proyecto, organizados por route groups ((admin), (pos), (auth), (setup)) que separan la aplicación en módulos funcionales sin afectar las URLs.


#### ¿Qué es una arquitectura hibrida monolítica?
Es un enfoque de diseño de software que combina la estructura unificada de un monolito tradicional con elementos de microservicios, diseñado para ser construido y desplegado como una sola unidad.
