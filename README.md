# The Great EIA Camel vs. Dwarf Racing System 🐪🏃‍♂️

Sistema de información integral y REST API desarrollado para la liga de carreras de camellos contra enanos de la Universidad EIA. La plataforma gestiona de forma segura y persistente el ciclo de vida de los competidores, equipos, programación de eventos, inscripciones, resultados oficiales y cálculo automático de clasificaciones (*standings*), cumpliendo con rigurosas reglas de negocio.

## 👥 Equipo de Desarrollo

- **Juan José Ramírez Pulgarín:** Arquitectura Backend (Java, Spring Boot, seguridad y base de datos).
- **Michelle Ruíz Segura:** Desarrollo Frontend (Vanilla JS, UI/UX y consumo de API).
- **Stefany Hurtado Marín:** Desarrollo Frontend (Vanilla JS, enrutamiento SPA y dockerización del cliente).

## 🏗️ Arquitectura y Tecnologías

El sistema sigue una arquitectura por capas estrictamente definida para separar responsabilidades y garantizar la escalabilidad:

- **Controladores (`controller`):** Exponen los endpoints REST, validan los formatos de entrada y devuelven respuestas HTTP sin contener lógica de negocio.
- **Servicios (`service`):** Centralizan las reglas de negocio, las validaciones cruzadas entre entidades y la coordinación entre repositorios.
- **Repositorios (`repository`):** Interfaces de Spring Data JPA para la persistencia y el acceso a datos.
- **DTOs y excepciones (`dto` / `exception`):** Separan los contratos de la API de las entidades persistentes y centralizan el manejo de errores estandarizados mediante `GlobalExceptionHandler.java`.

### Stack tecnológico

- **Backend:** Java 21, Spring Boot 3, Spring Web, Spring Security y Spring Data JPA.
- **Base de datos:** PostgreSQL.
- **Frontend:** Vanilla JavaScript (SPA nativa con enrutador por hash), HTML5, CSS3 y Nginx.
- **Infraestructura:** Docker y Docker Compose.
- **Pruebas automatizadas:** JUnit y Mockito (18 pruebas unitarias).

## 🗄️ Modelo de Base de Datos

La persistencia relacional en PostgreSQL incluye un esquema robusto con las siguientes entidades principales:

- **`User` y `Role`:** Gestión de credenciales y permisos de acceso.
- **`Competitor`:** Registro de enanos, camellos y competidores, incluyendo características físicas, país de origen y estado actual.
- **`Team` y `TeamMember`:** Gestión de equipos, entrenadores y asociaciones de miembros.
- **`Race`, `RaceRegistration` y `RaceResult`:** Programación de eventos, control de carriles, aprobación de inscripciones y registro de tiempos y posiciones.
- **`AuditLog`:** Módulo de auditoría que registra de manera inmutable las acciones críticas ejecutadas en el sistema.

## 🔒 Estrategia de Seguridad y Permisos

La seguridad se implementa mediante **JSON Web Tokens (JWT)** bajo una arquitectura sin estado (*stateless*). Las contraseñas de usuario se almacenan mediante hashing seguro con **BCrypt**. Ningún secreto o token se expone en las respuestas de la API ni se versiona en el código fuente.

### Roles del sistema

- **`ADMINISTRATOR`:** Gestión global de usuarios, competidores, equipos, carreras, registros, resultados y registros de auditoría.
- **`ORGANIZER`:** Administración de carreras, gestión y aprobación de inscripciones y registro oficial de resultados.
- **`VIEWER`:** Acceso exclusivo de lectura al calendario de eventos, resultados públicos y tablas de clasificación.

## ⚙️ Variables de Entorno y Configuración

Por motivos de seguridad, las credenciales reales y los tokens sensibles se gestionan exclusivamente mediante variables de entorno. Crea un archivo local `.env` en la raíz del proyecto; este archivo debe estar excluido de Git mediante `.gitignore`.

Usa la siguiente estructura como referencia:

```env
DB_HOST=camel-dwarf-db
DB_PORT=5432
DB_NAME=racing_db
DB_USERNAME=postgres
DB_PASSWORD=password_seguro_aqui
JWT_SECRET=tu_clave_secreta_jwt_en_base64_altamente_segura
JWT_EXPIRATION=86400000
```

## 🚀 Instalación y Ejecución con Docker

1. Clona el repositorio en tu máquina local.
2. Configura el archivo `.env` en la raíz con los parámetros requeridos.
3. Ejecuta el orquestador de contenedores desde la raíz del proyecto:

```bash
docker compose up -d --build
```

## 🌐 URLs y Puertos de los Componentes

| Componente | URL o puerto |
| --- | --- |
| Interfaz gráfica (Frontend SPA) | [http://localhost:8081](http://localhost:8081) |
| API REST (Backend Spring Boot) | [http://localhost:8080/api](http://localhost:8080/api) |
| Base de datos (PostgreSQL) | Puerto `5432` |

## 🔑 Usuarios de Prueba

Al inicializar la aplicación con una base de datos limpia, `DataSeeder` inyecta automáticamente los usuarios obligatorios:

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Organizador | `organizer` | `org123` |
| Espectador | `viewer` | `view123` |

## 🧪 Instrucciones de Testing

Para verificar el comportamiento de la capa de servicios y ejecutar la suite de pruebas unitarias automatizadas con JUnit y Mockito, ejecuta el siguiente comando dentro de la carpeta `backend`:

```bash
./mvnw test
```

En Windows también puedes utilizar:

```powershell
.\mvnw.cmd test
```
