# RealChat - Plataforma de Chat en Tiempo Real 🚀

### Prueba Técnica ACEMA Ingeniería / Solux Operaciones

Aplicación web de mensajería instantánea inspirada en **WhatsApp**, desarrollada con arquitectura limpia (**Clean Architecture**), patrón **CQRS** organizativo, comunicación bidireccional mediante **WebSockets**, entorno de ejecución **Bun**, framework **NestJS** en el backend, base de datos relacional **PostgreSQL**, y frontend reactivo con **Next.js 15**, **Tailwind CSS** y componentes **shadcn/ui**.

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Arquitectura y Decisiones Tecnológicas](#-arquitectura-y-decisiones-tecnológicas)
   - [Backend (NestJS + Bun + Clean Architecture + CQRS)](#backend)
   - [Base de Datos (PostgreSQL + Prisma ORM)](#base-de-datos)
   - [Frontend (Next.js + shadcn/ui + Heurísticas de Nielsen)](#frontend)
3. [Requisitos Previos](#-requisitos-previos)
4. [Manual de Ejecución Rápida con Docker (Recomendado)](#-manual-de-ejecución-rápida-con-docker-recomendado)
5. [Manual de Ejecución en Entorno Local (Paso a Paso)](#-manual-de-ejecución-en-entorno-local-paso-a-paso)
6. [Variables de Entorno y Validación con Joi](#-variables-de-entorno-y-validación-con-joi)
7. [Endpoints de la API REST y Eventos de WebSockets](#-endpoints-de-la-api-rest-y-eventos-de-websockets)
8. [Buenas Prácticas de UX y Heurísticas de Nielsen](#-buenas-prácticas-de-ux-y-heurísticas-de-nielsen)

---

## ✨ Características Principales

- **Autenticación Segura de Usuarios**: Registro, login y validación de sesiones mediante JWT con contraseñas encriptadas con bcrypt.
- **Chats Directos 1 a 1**: Búsqueda de cualquier usuario registrado en la plataforma e inicio instantáneo de conversaciones individuales con preservación de idempotencia.
- **Chats Grupales**: Creación de grupos con múltiples usuarios simultáneos, nombres personalizados y aislamiento estricto (solo los miembros agregados al grupo reciben y visualizan los mensajes).
- **Mensajería Instantánea por WebSockets**: Envío y recepción de mensajes en tiempo real sin recargar la página, con marcas de tiempo, datos del remitente y doble check de entrega.
- **Indicadores en Tiempo Real**: Estado de conexión (en línea / desconectado) en vivo, aviso de "escribiendo..." en conversaciones activas y banners de reconexión automática ante caídas de red.
- **Persistencia Completa**: Historial de mensajes, chats y participantes almacenados en PostgreSQL.
- **Modo Claro / Modo Oscuro**: Soporte para temas con detección automática del sistema y cambio manual instantáneo.
- **Diseño 100% Responsive**: Experiencia optimizada tanto para escritorio (diseño en dos paneles tipo WhatsApp Web) como para dispositivos móviles (navegación fluida entre lista de chats y sala de conversación).

---

## 🏛 Arquitectura y Decisiones Tecnológicas

### Backend

- **Entorno de Ejecución**: **Bun** (v1.3+). Proporciona un arranque ultra rápido (~50ms), rendimiento I/O superior y compatibilidad nativa con TypeScript.
- **Framework**: **NestJS**. Proporciona modularidad empresarial, inyección de dependencias robusta y soporte oficial para WebSockets y CQRS.
- **Clean Architecture**:
  Cada módulo (`auth`, `users`, `chats`, `messages`, `realtime`) está desacoplado en 4 capas estrictas:
  - **`domain`**: Entidades del negocio puras y contratos de repositorios abstractos independientes del framework o base de datos.
  - **`application`**: Casos de uso estructurados bajo el patrón **CQRS**:
    - **Commands**: Modificaciones de estado (`RegisterCommand`, `LoginCommand`, `CreateChatCommand`, `SendMessageCommand`).
    - **Queries**: Consultas de solo lectura (`GetAllUsersQuery`, `GetUserByIdQuery`, `GetUserChatsQuery`, `GetChatMessagesQuery`).
    - **DTOs**: Data Transfer Objects con validación por decoradores (`class-validator`).
  - **`infrastructure`**: Implementación concreta de repositorios con **Prisma ORM**, servicios de hashing y estrategias de autenticación JWT de Passport.
  - **`presentation`**: Controladores HTTP REST (`AuthController`, `UsersController`, `ChatsController`, `MessagesController`) y el Gateway de WebSockets (`ChatGateway`).

### Base de Datos

- **PostgreSQL 16**: Motor relacional con integridad referencial, índices únicos y relaciones en cascada.
- **Prisma ORM**: Tipado seguro de extremo a extremo, migraciones y esquemas declarativos.

### Frontend

- **Framework**: **Next.js 15** con App Router y arquitectura modular orientada a streaming (`src/app/`, `src/components/`, `src/contexts/`, `src/lib/`).
- **Librería de Componentes**: **shadcn/ui** construida sobre Radix UI y Tailwind CSS.
- **Manejo de Estado Global**: Implementado limpiamente mediante **React Context API** con separación de responsabilidades:
  - `AuthContext`: Gestión del usuario autenticado, persistencia de tokens JWT y protección de rutas.
  - `SocketContext`: Ciclo de vida de la conexión WebSockets, detección de reconexión y lista de usuarios en línea.
  - `ChatContext`: Conversación activa, mensajes en tiempo real, estados de escritura e historial.

---

## 📦 Requisitos Previos

- **Docker** y **Docker Compose** (versión 20+ / Docker Compose v2+).
- _Opcional (solo si ejecutas localmente sin Docker)_:
  - [Bun](https://bun.sh/) (v1.1 o superior).
  - [Node.js](https://nodejs.org/) (v20 o superior).
  - Instancia local de PostgreSQL corriendo en el puerto 5432.

---

## 🐳 Manual de Ejecución Rápida con Docker (Recomendado)

Con un solo comando se levanta toda la infraestructura (Base de datos PostgreSQL, Backend NestJS en Bun y Frontend Next.js).

### 1. Clonar el repositorio y navegar a la raíz

```bash
git clone <URL_DEL_REPOSITORIO>
cd real-chat
```

### 2. Configurar variables de entorno

El repositorio incluye archivos `.env` y `.env.template` preconfigurados para Docker. Si deseas crear uno nuevo:

```bash
cp .env.template .env
```

### 3. Levantar la aplicación con Docker Compose

```bash
docker compose up --build -d
```

### 4. Verificar que los contenedores estén activos

```bash
docker compose ps
```

Deberías ver los 3 servicios corriendo:

- `realchat-postgres`: Puerto `5432` (con healthcheck activo).
- `realchat-backend`: Puerto `3001` (NestJS corriendo bajo Bun).
- `realchat-frontend`: Puerto `3000` (Next.js en producción).

### 5. Acceder a la Aplicación

- 🌐 **Frontend (Web App)**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend (API REST)**: [http://localhost:3001/api](http://localhost:3001/api)
- ⚡ **WebSockets**: `ws://localhost:3001`

### 6. Detener los contenedores

```bash
docker compose down
```

_(Si deseas eliminar también el volumen de la base de datos: `docker compose down -v`)_.

---

## 💻 Manual de Ejecución en Entorno Local (Paso a Paso)

Si deseas ejecutar el proyecto localmente sin contenedores para backend y frontend:

### 1. Iniciar PostgreSQL

Asegúrate de tener un contenedor o servicio de PostgreSQL activo en el puerto 5432:

```bash
docker run -d --name local-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=realchat_db -p 5432:5432 postgres:16-alpine
```

### 2. Configurar y Levantar el Backend

```bash
cd backend

# Copiar variables de entorno
cp .env.template .env

# Instalar dependencias con Bun
bun install

# Sincronizar esquema de base de datos con Prisma
bun run prisma:push

# Iniciar servidor en modo desarrollo
bun run start:dev
```

El backend estará disponible en `http://localhost:3001/api`.

### 3. Configurar y Levantar el Frontend

En una nueva pestaña de terminal:

```bash
cd frontend

# Copiar variables de entorno
cp .env.template .env.local

# Instalar dependencias con Bun
bun install

# Iniciar en modo desarrollo
bun run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🔐 Variables de Entorno y Validación con Joi

El backend valida estrictamente las variables de entorno al iniciar mediante el archivo `backend/src/config/envs.ts` utilizando la librería **Joi**, evitando que la aplicación inicie con configuraciones faltantes o corruptas:

```typescript
import 'dotenv/config';
import Joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
}

const envsSchema = Joi.object({
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('*'),
}).unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
// ...
```

---

## 📡 Endpoints de la API REST y Eventos de WebSockets

### Rutas HTTP REST (`/api`)

| Método   | Endpoint                  | Descripción                                                         | Requiere Auth   |
| :------- | :------------------------ | :------------------------------------------------------------------ | :-------------- |
| **POST** | `/api/auth/register`      | Registro de nuevo usuario (`name`, `email`, `password`)             | No              |
| **POST** | `/api/auth/login`         | Inicio de sesión con credenciales válidas                           | No              |
| **GET**  | `/api/auth/me`            | Obtiene el perfil del usuario autenticado                           | Sí (Bearer JWT) |
| **GET**  | `/api/users`              | Lista todos los usuarios registrados excepto el actual              | Sí (Bearer JWT) |
| **GET**  | `/api/users/:id`          | Obtiene la información de un usuario específico                     | Sí (Bearer JWT) |
| **POST** | `/api/chats`              | Crea un chat directo o grupal (`participantIds`, `name`, `isGroup`) | Sí (Bearer JWT) |
| **GET**  | `/api/chats`              | Lista los chats del usuario con último mensaje                      | Sí (Bearer JWT) |
| **GET**  | `/api/chats/:id`          | Detalle del chat y participantes                                    | Sí (Bearer JWT) |
| **GET**  | `/api/chats/:id/messages` | Historial de mensajes de una conversación                           | Sí (Bearer JWT) |
| **POST** | `/api/chats/:id/messages` | Envío de mensaje vía REST (fallback a socket)                       | Sí (Bearer JWT) |

### Eventos de WebSockets (Socket.io)

- **Handshake de Autenticación**: Token JWT enviado en `auth.token`.
- **`join_chat`**: Conexión al canal de un chat específico (con validación de membresía).
- **`send_message`**: Envía un mensaje en tiempo real, almacena en base de datos y emite `new_message` a la sala del chat y `chat_updated` a la lista de chats de los participantes.
- **`new_message`**: Recepción instantánea del mensaje para todos los participantes del chat.
- **`create_chat`**: Notificación en tiempo real a los participantes cuando se crea un nuevo chat directo o grupo.
- **`typing_start` / `typing_stop`**: Indicador de escritura en vivo.
- **`user_status` / `online_users`**: Notificación de usuarios que entran o salen de línea.
