# Tesis - Django + React (Web)

Proyecto base con backend en Django REST y frontend en React web (Vite).

## Estructura actual

```text
tesis/
	backend/                # API Django
		.venv/
		api/
		config/
		db.sqlite3
		manage.py
	frontend/               # App React web con Vite
		src/
		package.json
	mobile/                 # App React Native con Expo (legacy, opcional)
	index.html              # Archivo original del proyecto
	tesis_lab_nuclear.ipynb # Notebook original
```

## Cambios realizados

1. Se creo el backend Django en `backend/`.
2. Se instalo y configuro Django REST Framework.
3. Se instalo y configuro `django-cors-headers` para permitir consumo desde entorno local.
4. Se agrego endpoint de prueba:
	 - `GET /api/health/`
	 - Respuesta: `{"message": "Backend Django funcionando", "status": "ok"}`
5. Se migraron funciones del notebook `tesis_lab_nuclear.ipynb` a la API:
	- `POST /api/energia-final/`
	- `POST /api/monte-carlo/`
6. Se creo la app React Native con Expo (template TypeScript) en `mobile/`.
7. Se migro a React web con Vite en `frontend/`.
8. Se conecto `frontend/src/App.tsx` al backend de Django.
9. Se mejoro la interfaz de React web para mostrar:
	 - Estado de backend
	- Acceso al front original del notebook
	- Formulario de energia final
	- Simulacion monte carlo

## Archivos clave modificados

- `backend/config/settings.py`
- `backend/config/urls.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `tesis_lab_nuclear.ipynb` (fuente de la logica migrada)

## Requisitos

- Python 3.13+
- Node.js 20+ (recomendado)
- npm

## Como ejecutar el proyecto

### 1) Backend Django

Desde la raiz del proyecto (`tesis/`):

```powershell
& "c:\Users\jose.valdez\Downloads\tesis\tesis\backend\.venv\Scripts\python.exe" "c:\Users\jose.valdez\Downloads\tesis\tesis\backend\manage.py" runserver 127.0.0.1:8000
```

Backend disponible en:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/api/health/
- http://127.0.0.1:8000/api/energia-final/
- http://127.0.0.1:8000/api/monte-carlo/
- http://127.0.0.1:8000/api/fision/

### 1.1) Endpoints migrados desde el notebook

`POST /api/energia-final/`

Body JSON:

```json
{
	"E": 2.5,
	"A": 56,
	"theta": 45
}
```

`POST /api/monte-carlo/`

Body JSON:

```json
{
	"p": 0.7,
	"n0": 10,
	"pasos": 20,
	"seed": 42
}
```

`GET /api/fision/`

- Abre una simulacion visual interactiva de fision nuclear.
- Disponible desde navegador o con el boton "Abrir simulacion de fision" dentro de la app.
- Esta ruta ahora carga el HTML_FISION original extraido de `tesis_lab_nuclear.ipynb`.

### 2) Frontend React (web local)

Desde cualquier ruta:

```powershell
npm --prefix "c:\Users\jose.valdez\Downloads\tesis\tesis\frontend" run dev
```

Frontend web disponible en:

- http://localhost:5173

### 2.1) CORS habilitado

El backend permite ahora estos orígenes locales:

- http://localhost:5173
- http://127.0.0.1:5173
- http://localhost:8081
- http://127.0.0.1:8081

## Nota sobre mobile

La carpeta `mobile/` se mantiene como legado, pero el frontend principal ahora es `frontend/` (React web).

## Proximos pasos sugeridos

1. Implementar autenticacion (JWT con DRF).
2. Crear modelos de negocio para la tesis.
3. Agregar pantallas reales (login, dashboard, capturas).
4. Preparar build Android con EAS cuando la app este estable.