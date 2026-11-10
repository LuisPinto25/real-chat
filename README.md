# RealChat

## Tecnologías y Arquitectura

### Backend (`/backend`)

Construido con **NestJS**, **Bun**, **Prisma ORM** y **PostgreSQL**.

- **Clean Architecture (Arquitectura Limpia)**: Cada módulo (`auth`, `users`, `chats`, `messages`) está dividido en capas para no acoplar la lógica de negocio con el framework:
  - `domain`: Entidades e interfaces de los repositorios.
  - `application`: Casos de uso implementados con comandos, consultas y DTOs.
  - `infrastructure`: Implementación de repositorios con Prisma, estrategias JWT y servicios externos.
  - `presentation`: Controladores REST.
- **Patrón CQRS (`@nestjs/cqrs`)**: Separación de lecturas (_Queries_) y escrituras (_Commands_) mediante `CommandBus` y `QueryBus`.
- **Patrón Repositorio + Inyección de Dependencias**: La capa de aplicación depende de interfaces y no directamente de Prisma.
- **WebSockets (`Socket.IO`)**: Un `ChatGateway` que maneja eventos en tiempo real (`send_message`, `new_message`, `create_chat`, `typing_start`, `typing_stop`, `user_status`).
- **Autenticación JWT**: Protección de endpoints HTTP con Guards y validación del token en la conexión de WebSockets.

### Frontend (`/frontend`)

Construido con **Next.js 15 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS**.

- **Instancia de Axios + Interceptors (`/src/api`)**: Cliente HTTP centralizado (`chatApi`) con un interceptor que inyecta automáticamente el token JWT desde `localStorage` en cada petición y otro que formatea los errores del backend.
- **Patrón de Actions (`/src/actions`)**: Todas las llamadas HTTP al backend están separadas por dominio (`auth`, `chats`, `users`) en funciones independientes (`*.action.ts`).
- **Custom Hooks (`/src/hooks`)**: La lógica compleja está extraída en hooks reutilizables (`useSocketConnection`, `useChatSocketEvents`, `useChatActions`, `useTyping`, `useUsers`) para mantener los componentes y contextos pequeños.
- **Context API (`/src/contexts`)**: Manejo del estado global dividido en `AuthContext`, `SocketContext` y `ChatContext`.
- **Formularios con `react-hook-form`**: Validaciones en login y registro utilizando componentes pequeños y reutilizables.
- **Tema Claro / Oscuro**: Configurado con `next-themes` y componentes de UI basados en Radix UI.

---

## Cómo levantar el proyecto

> **Nota:** El proyecto está configurado por defecto para levantarse con **Bun** (`bun.lock`). Si prefieres usar otro manejador de paquetes o entorno de ejecución (como `npm`, `pnpm` o `yarn` con Node.js), puedes eliminar los archivos `bun.lock` y ejecutar los comandos equivalentes de tu preferencia.

### 1. Configurar variables de entorno

Antes de iniciar, crea los archivos `.env` copiando las plantillas en cada carpeta:

**En `/backend/.env`** (puedes copiar `/backend/.env.template`):

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realchat_db?schema=public
JWT_SECRET=super_secret_jwt_key_realchat
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**En `/frontend/.env.local`** (puedes copiar `/frontend/.env.template`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

### Opción A: Usando Docker (Recomendado)

Levanta la base de datos PostgreSQL, el backend y el frontend con un solo comando desde la raíz del proyecto:

```bash
docker compose up
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

---

### Opción B: Ejecución en Local

Necesitas tener instalado **Bun** (o Node.js) y una instancia de **PostgreSQL** corriendo en el puerto `5432`.

#### 1. Levantar la base de datos (si no tienes Postgres local puedes usar Docker solo para la BD):

```bash
docker compose up -d postgres
```

#### 2. Iniciar el Backend:

```bash
cd backend
bun install
bun run prisma:generate
bun run prisma:push
bun run start:dev
```

#### 3. Iniciar el Frontend (en otra terminal):

```bash
cd frontend
bun install
bun run dev
```

Luego abre **http://localhost:3000** en el navegador.
