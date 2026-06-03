# 💰 Control Financiero Personal (Web, Privacy-First)

Aplicación web **offline-first** para el control de finanzas personales, diseñada con un enfoque **privacy-first**:  
los datos **nunca salen del dispositivo del usuario** y no existe backend ni almacenamiento en servidores externos.

---

## 🎯 Objetivos del proyecto

- Controlar ingresos, gastos y presupuestos mensuales
- Analizar gastos por categoría y transacciones
- Funcionar **100% offline**
- Mantener los datos **solo del lado del cliente**
- Ser usable tanto en **mobile como en desktop**
- Evitar dependencias innecesarias y frameworks pesados

---

## ✨ Características principales

- 📊 Dashboard con KPIs y gráficos de ingresos/gastos por categoría
- ➕ Registro de ingresos y gastos con categorización
- 📅 Control por mes con selector dinámico
- 📈 Presupuestos por categoría con alertas de exceso
- 🚨 Alertas automáticas:
  - ⚠️ Mes en rojo (gastos > ingresos)
  - ⚠️ Ahorro bajo (< 10% del ingreso)
  - ⚠️ Categoría cerca del presupuesto (80%)
  - 🔴 Exceso de presupuesto por categoría
- 📂 Análisis de gastos por categoría con resumen
- 📋 Tabla de transacciones del mes actual
- 🌙 Tema oscuro (dark mode) nativo
- 🗂️ Navegación por tabs (Dashboard, Registro, Presupuestos, Análisis, Configuración)
- 💾 Persistencia local con **IndexedDB**
- 📦 Sistema de backups local:
  - Exportar en **JSON** o **CSV**
  - Exportar todo / solo ingresos / solo gastos / solo presupuestos
  - Importar backups completos en JSON
- ☁️ Backups en la nube (opcional):
  - Proveedor **Google Drive** configurable por el propio usuario (Client ID + API Key)
  - Los backups se guardan en una carpeta `app-finanzas/backup-YYYY.json`
- 🧹 Limpieza manual de la base de datos local con confirmación

---

## 🔐 Privacidad y seguridad

- ❌ No backend
- ❌ No cuentas de usuario
- ❌ No tracking
- ❌ No cookies
- ✅ Datos almacenados únicamente en el navegador (IndexedDB)
- ✅ Backups bajo control explícito del usuario (JSON)

El usuario es **dueño total de sus datos**.

---

## 🧱 Arquitectura

La aplicación ha sido migrada a una arquitectura basada en **Astro + React + TypeScript**, manteniendo el enfoque **offline-first** y **privacy-first**.

### Estructura general

```text
app-finanzas/
├── astro.config.mjs          # Configuración de Astro (React, Tailwind)
├── package.json              # Scripts de desarrollo/build
├── vercel.json               # Configuración de despliegue en Vercel (static build)
│
├── src/
│   ├── pages/
│   │   └── index.astro       # Página principal, monta el AppShell React
│   │
│   ├── layouts/
│   │   └── Layout.astro      # Layout base (shell HTML, estilos globales, etc.)
│   │
│   ├── components/
│   │   ├── AppShell/         # Shell principal (tabs: Dashboard, Registro, etc.)
│   │   ├── views/            # Vistas React por sección (Dashboard, Register, Budgets, Settings)
│   │   └── register/         # Componentes de registro (formularios, tabla de movimientos, etc.)
│   │
│   ├── core/
│   │   ├── domain/           # Tipos y lógica de dominio (movimientos, presupuestos, alertas)
│   │   ├── state/            # Store reactivo tipado (CoreStore)
│   │   ├── persistence/      # IndexedDB, repositorio tipado, backup local
│   │   ├── cloud/            # Adaptador tipado para backups en la nube (Google Drive)
│   │   └── app/              # Facade AppCore: contrato único para la UI
│   │
│   ├── context/
│   │   └── AppContext.tsx    # Contexto React que expone estado + acciones del core
│   │
│   └── hooks/
│       └── useAppCore.ts     # Hook que inicializa e interactúa con AppCore
│
└── public/                   # Recursos estáticos (si aplica)
```

### 🏗️ Arquitectura de capas

```
┌─────────────────────────────────────────────┐
│  UI Layer (Astro pages + React views)       │  Navegación por tabs, formularios, tablas
├─────────────────────────────────────────────┤
│  App Facade (core/app/AppCore)             │  Contrato único para la UI (acciones + queries)
├─────────────────────────────────────────────┤
│  Domain Layer (core/domain)                │  Lógica pura de negocio (alertas, presupuestos, etc.)
├─────────────────────────────────────────────┤
│  State Layer (core/state)                  │  Store observable tipado (CoreStore)
├─────────────────────────────────────────────┤
│  Persistence Layer (core/persistence)      │  IndexedDB + backups locales (JSON/CSV)
├─────────────────────────────────────────────┤
│  Cloud Layer (core/cloud)                  │  Adaptador a proveedores de nube (Google Drive)
├─────────────────────────────────────────────┤
│  Browser Storage (IndexedDB, localStorage) │  Almacenamiento físico
└─────────────────────────────────────────────┘
```

### 🔄 Flujo de datos (versión Astro/React)

1. **Usuario interactúa** con formularios/botones en las vistas React (por ejemplo `RegisterView`).
2. Las vistas llaman a **acciones del core** expuestas por `AppCore` vía `AppContext` (por ejemplo `addIncome`, `addExpense`, `saveBudget`).
3. El core actualiza el **store reactivo** (`CoreStore`) y **persiste** los datos en IndexedDB a través del `Repository` tipado.
4. Las vistas React se suscriben al estado del core y se **re-renderizan automáticamente** cuando cambian los datos.
5. Las operaciones de **backup local** y **backup en la nube** también pasan por `AppCore`, manteniendo un único punto de entrada para toda la lógica.

### 📋 Principios clave

- **AppCore como fachada única** → La UI solo conoce un contrato (`AppCore`), lo que facilita la evolución interna del core.
- **Domain-first** → La lógica de negocio (alertas, presupuestos, cálculos) vive en `core/domain` como funciones puras.
- **Repository Pattern** → Persistencia abstraída en `core/persistence`, actualmente implementada con IndexedDB.
- **Observable Store** → `CoreStore` expone `getState`, `setState`, `subscribe` para un flujo de datos claro y predecible.
- **UI desacoplada** → Las vistas React se enfocan en la presentación y en llamar a acciones del core, sin lógica de persistencia.
- **Build estático** → Astro genera un **sitio estático** que monta un `AppShell` React mediante `client:load`, manteniendo buen rendimiento y SEO.

---

## 🧩 Historia y migración

- La primera versión de la app estaba construida con **HTML + CSS + JavaScript (ES Modules)**, sin frameworks.
- Para mejorar la **productividad**, la **composición de vistas** y la **extensibilidad**, se migró gradualmente a **Astro + React + TypeScript**.
- La lógica de negocio se reestructuró en torno a un `AppCore` tipado, pero se mantuvo el mismo modelo de datos básico (incomes, expenses, budgets) y la persistencia en **IndexedDB**.
- Los **backups locales** (JSON/CSV) y la integración con **Google Drive** se conservaron y se adaptaron al nuevo core tipado.
- El objetivo de la migración fue mejorar la arquitectura interna sin romper el enfoque original: **offline-first**, **privacy-first** y sin backend.

---

## 🗃️ Persistencia de datos

- **Fuente de verdad:** IndexedDB
- **Almacenes:** incomes, expenses, budgets
- **Backups locales:**
  - Módulo `core/backup` con proveedores de formato (JSON, CSV)
  - Exportar:
    - Todo (`incomes`, `expenses`, `budgets`)
    - Solo gastos
    - Solo ingresos
    - Solo presupuestos
  - Importar backups completos desde JSON
- **Backups en la nube (opcional):**
  - Proveedor Google Drive configurado por el usuario
  - Los backups se almacenan en la carpeta `app-finanzas/` de su Drive
  - Un archivo por año: `backup-YYYY.json` (por ejemplo `backup-2026.json`)
  - La restauración toma el backup más reciente disponible
- **Identificadores:** Auto-incrementales para transacciones, categoría como clave para presupuestos

---

## 🛠️ Estructura de datos

```javascript
// Ingreso
{
  id: <auto>,
  date: "2026-01-15",
  month: "2026-01",
  type: "Salario",
  amount: 2000000
}

// Gasto
{
  id: <auto>,
  date: "2026-01-15",
  month: "2026-01",
  category: "Alimentación",
  description: "Mercado",
  amount: 150000
}

// Presupuesto
{
  category: "Arriendo",
  amount: 900000
}
```

---

## 🚀 Cómo usar y desarrollar la app

### Entorno local (desarrollo)

Requisitos:

- Node.js `>= 22.12.0`

Instalación de dependencias:

```bash
npm install
```

Levantar el entorno de desarrollo de Astro:

```bash
npm run dev
```

Por defecto, la app estará disponible en una URL tipo `http://localhost:4321`.

### Build de producción

```bash
npm run build
```

Astro generará un sitio estático en la carpeta `dist/`, que es la que se despliega en producción.

### Despliegue en Vercel

El proyecto incluye un `vercel.json` configurado para usar `@vercel/static-build` con salida en `dist`. El flujo típico es:

1. Conectar el repositorio a Vercel.
2. Asegurarse de que el comando de build sea `npm run build` y el output directory sea `dist`.
3. Cada push a la rama configurada dispara un nuevo despliegue.

La app sigue sin requerir backend propio: todo se ejecuta en el navegador del usuario.

---

## 📱 Compatibilidad

- Chrome / Edge
- Firefox
- Safari (desktop y mobile)
- Compatible con navegadores modernos que soporten IndexedDB

---

## � Categorías de gastos

Las categorías de gastos están predefinidas en el formulario:
- **Arriendo**
- **Alimentación**
- **Servicios**
- **Moto**
- **Ocio**

---

## 🧭 Navegación de la app

La interfaz está organizada en 5 tabs principales:

1. **Dashboard** - KPIs, balance y gráficos de ingresos vs gastos
2. **Registro** - Formularios para agregar ingresos y gastos
3. **Presupuestos** - Tabla de presupuestos por categoría y alertas
4. **Análisis** - Resumen por categoría y tabla detallada de transacciones
5. **Configuración** - 
   - Sección **Backup**: backups locales (JSON/CSV), restauración y zona de peligro.
   - Sección **Persistencia de datos**: selección y configuración de proveedor de almacenamiento (Google Drive).

---

- HTML5
- CSS (variables, dark theme)
- JavaScript (ES Modules)
- IndexedDB (persistencia)
- Canvas API (gráficos)

---

## 🧠 Estado del proyecto

✔ Funcional  
✔ Estable  
✔ Pensado para uso personal  
✔ Listo para futuras mejoras (PWA, cifrado, sync opcional)

---

## 📌 Mejoras pendientes

- 🔐 Cifrado client-side (opcional)
- 📱 PWA instalable
- ✏️ Edición/eliminación de transacciones registradas
- 🔍 Filtros y búsqueda avanzada
- 🌗 Toggle light/dark theme
- 📝 Edición de categorías personalizadas
- 🧪 Tests automatizados

---

## ☁️ Configurar backup en la nube con Google Drive

La integración con Google Drive es **opcional** y se configura 100% en el navegador.

### 1. Crear un proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com/).
2. Crear un proyecto nuevo (por ejemplo `app-finanzas`).
3. En **APIs & Services → Library**, habilitar la **Google Drive API**.

### 2. Crear credenciales

En **APIs & Services → Credentials**:

1. Crear una **API Key**.
2. Crear un **OAuth 2.0 Client ID** de tipo **Web application**.
   - Añadir el origen autorizado correspondiente a donde sirves la app
     (por ejemplo `http://localhost:4173` o la URL de Vercel).

Guarda:

- `Client ID` (formato `xxxxx.apps.googleusercontent.com`).
- `API Key`.

### 3. Configurar pantalla de consentimiento (OAuth consent screen)

En **APIs & Services → OAuth consent screen**:

1. Seleccionar tipo de usuario `External` (para uso personal está bien en modo Testing).
2. Completar los campos mínimos (nombre de la app, mail de soporte, etc.).
3. Añadir tu(s) cuenta(s) de Google como **Test users**.

> Mientras el proyecto esté en modo Testing, solo los correos añadidos como Test users
> podrán autorizar la app.

### 4. Conectar Google Drive desde la app

En la aplicación `app-finanzas`:

1. Ir a la pestaña **Configuración → Persistencia de Datos**.
2. En "Almacenamiento" seleccionar **Google Drive**.
3. Rellenar:
   - **Client ID** (copiado de Google Cloud).
   - **API Key**.
4. Pulsar el botón **"Configurar proveedor"**.
   - Se abrirá el popup de Google para elegir la cuenta y autorizar la app.
   - Si todo va bien, verás un mensaje del tipo:
     - `Conectado a Google Drive como tu-correo@ejemplo.com`.

### 5. Usar los backups en la nube

Con el proveedor configurado:

1. Ir a **Configuración → Backup**.
2. Usar los botones:
   - **"Guardar backup en la nube"** → sube un backup completo a tu Drive.
   - **"Restaurar desde la nube"** → restaura el backup más reciente.

Los archivos se guardan en tu Google Drive en una carpeta `app-finanzas/`, con un
archivo por año:

- `backup-2025.json`, `backup-2026.json`, etc.

> La app nunca envía tus credenciales ni tus datos financieros a ningún servidor.  
> Las claves y el estado de autenticación se guardan únicamente en tu navegador (localStorage).

---

## 📄 Licencia

Uso personal / educativo.  
El usuario es responsable de la gestión y respaldo de sus datos.
