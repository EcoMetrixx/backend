# Ecometrix Backend

Este proyecto utiliza **NestJS** para el backend, **Docker** para contenedores y está organizado siguiendo principios de **Clean Architecture**.

El objetivo de este README es servir como guía de desarrollo para cualquier miembro del equipo.

---

## 📦 Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (para desarrollo local opcional)
- VSCode con extensiones recomendadas (ver sección de extensiones)
- Git

---

## ⚙️ Extensiones recomendadas para VSCode

Estas extensiones mejoran la productividad y facilitan el desarrollo:

- **Docker** (`ms-azuretools.vscode-docker`) – Para manejar contenedores y volúmenes.
- **Prettier - Code formatter** (`esbenp.prettier-vscode`) – Formateo de código consistente.
- **Thunder Client** (`rangav.vscode-thunder-client`) – Para probar APIs directamente desde VSCode.
- **Peacock** (`johnpapa.vscode-peacock`) – Para diferenciar visualmente proyectos abiertos en VSCode.

---

## 🏗 Arquitectura del proyecto

El backend sigue **Clean Architecture**, lo que implica:

1. **Capa de Dominio:** Contiene entidades y lógica de negocio pura.
2. **Capa de Aplicación:** Casos de uso que coordinan la lógica entre dominio y adaptadores.
3. **Capa de Infraestructura / Frameworks:** Adaptadores, controladores, repositorios, conexión a bases de datos, etc.
4. **Separación de responsabilidades:** Cada capa solo depende de las capas interiores.

> Beneficios: mantenibilidad, testeo sencillo, independencia de frameworks y bases de datos.

---

## 🐳 Desarrollo con Docker

### Levantar contenedores

- **Iniciar todos los contenedores y reconstruir si es necesario:**

```bash
docker-compose up --build -d
```

- **Levantar solo el backend (API):**

```bash
docker-compose up -d backend
```

- **Levantar solo la base de datos:**

```bash
docker-compose up -d database
```

### Detener contenedores

- **Detener todos los contenedores:**

```bash
docker-compose stop
```

- **Detener solo el backend:**

```bash
docker-compose stop backend
```

- **Detener solo la base de datos:**

```bash
docker-compose stop database
```

### Acceso al contenedor

- **Entrar a la shell del backend:**

```bash
docker-compose exec backend sh
```

- **Reiniciar el contenedor del backend:**

```bash
docker-compose restart backend
```

### Instalación de dependencias

- **Instalar dependencias dentro del contenedor backend:**

```bash
docker-compose exec backend sh -c 'npm install'
```

- También puedes usar tu editor y tareas de VSCode para sincronizar `node_modules` si es necesario.

### Limpieza

- **Eliminar contenedores, imágenes huérfanas y recursos no utilizados:**

```bash
docker system prune -f
```

---

## 🚀 Tareas de desarrollo en VSCode

Se definieron tareas para mejorar el flujo de trabajo:

| Tarea                      | Descripción                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| 📦 Enter DockerShell       | Accede a la shell dentro del contenedor `api_ecometrix`.             |
| 🚀 Start API Service       | Ejecuta `npm run start:dev` dentro del backend para levantar la API. |
| ▶️ Start API Container     | Levanta el contenedor `backend` (api_ecometrix).                     |
| ⏸️ Stop API Container      | Detiene el contenedor `backend` sin eliminarlo.                      |
| 🔄 Start Database          | Levanta la base de datos `db_ecometrix_local`.                       |
| ⏸️ Stop Database           | Detiene la base de datos sin eliminarla.                             |
| ⏹️ Stop All Containers     | Detiene todos los contenedores definidos en `docker-compose.yml`.    |
| 🔄 Restart API             | Reinicia el contenedor `backend`.                                    |
| 🔨 Rebuild Containers      | Reconstruye todos los contenedores y los levanta en segundo plano.   |
| 🧹 Clean Docker Containers | Limpia contenedores, imágenes y redes no utilizadas.                 |
| ⬇️ Install Dependencies    | Instala las dependencias de Node dentro del backend.                 |

> Todas estas tareas pueden ejecutarse desde la paleta de comandos de VSCode (`Ctrl+Shift+P`) o desde la vista de **Tareas**.

---

## 📝 Recomendaciones de desarrollo

1. **Siempre desarrollar dentro del contenedor** (`docker-compose exec backend sh`) para garantizar consistencia entre entornos.
2. **Node_modules bind mount:** se sincroniza con tu máquina local, así puedes usar tu editor sin problemas.
3. **Prettier y formateo:** guarda los archivos con `formatOnSave` activado.
4. **Pruebas unitarias:** mantén la lógica de negocio testeable y aislada de frameworks.
5. **Clean Architecture:** respeta la separación de capas para no acoplar infraestructura con lógica de dominio.
6. **Commit frecuente:** usa `.gitignore` para evitar subir `node_modules` y archivos temporales.

---

## 📁 Estructura típica del backend (Clean Architecture)

```
backend/
│
├─ src/
│   ├─ domain/         # Entidades y lógica de negocio
│   ├─ application/    # Casos de uso
│   ├─ infrastructure/ # Repositorios, DB, adaptadores
│   ├─ presentation/   # Controladores, rutas, DTOs
│   ├─ auth/           # Módulo de autenticación JWT
│   ├─ users/          # Módulo de usuarios
│   ├─ common/         # Guards, decorators, etc.
│   ├─ database/       # Seeds y migraciones
│   └─ main.ts         # Bootstrapping de NestJS
│
├─ node_modules/
├─ .env
├─ .gitignore
├─ .prettierrc
├─ package.json
└─ tsconfig.json
```

---

## 🔐 Autenticación JWT

El backend incluye un sistema completo de autenticación con JWT que incluye:

### Endpoints disponibles

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión (requiere autenticación)
- `POST /api/auth/refresh` - Refrescar token (requiere autenticación)
- `POST /api/auth/password-reset` - Solicitar recuperación de contraseña
- `POST /api/auth/password-reset/confirm` - Confirmar recuperación de contraseña

### Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=3600

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# Email (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Usuario de prueba

Para crear el usuario de prueba, ejecuta:

```bash
npm run seed
```

Esto creará un usuario con:
- **Email**: `user@dwduqs.com`
- **Password**: `miVivienda#2024`
- **Name**: `Juan Torres`
- **Role**: `Asesor Hipotecario`

### Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a la documentación de Swagger en:
- `http://localhost:3000/api`

---

## 🚀 Inicio rápido

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Asegúrate de que PostgreSQL esté corriendo** (o usa Docker)

4. **Crear usuario de prueba:**
   ```bash
   npm run seed
   ```

5. **Iniciar el servidor:**
   ```bash
   npm run start:dev
   ```

El servidor estará disponible en `http://localhost:3000/api`
