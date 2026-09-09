# The Great EIA Camel vs. Dwarf Racing System - Backend API 🐪🧔‍♂️

Bienvenido al repositorio del Backend para la liga de carreras de la Universidad EIA. Este proyecto expone una API REST segura desarrollada en Java 21 con Spring Boot, PostgreSQL y Docker.

## 🛠️ Tecnologías Usadas

* **Java 21** & **Spring Boot 3**
* **Spring Security & JWT** para Autenticación
* **PostgreSQL** como Base de Datos persistente
* **Docker & Docker Compose** para despliegue automático
* **Lombok** para código limpio

## 🚀 Instrucciones para el equipo de Frontend

Para levantar el entorno completo localmente y empezar a consumir la API, sigue estos pasos:

### 1. Variables de Entorno

Por seguridad, las credenciales no están subidas a GitHub. Crea un archivo llamado `.env` en la raíz del proyecto (junto al `compose.yml`) y pega lo siguiente:

```env
DB_HOST=postgres-db
DB_PORT=5432
DB_NAME=camel_dwarf_db
DB_USERNAME=mr_abandonado
DB_PASSWORD=super_secret_password_2026
JWT_SECRET=una_clave_super_secreta_para_jwt_que_debe_ser_larga_y_segura_eia
JWT_EXPIRATION=86400000
API_BASE_URL=http://localhost:8080/api
