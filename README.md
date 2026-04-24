# GastroMind AI 🍽️

Sistema de recomendaciones personalizadas con IA para el restaurante **Tanta** (Lima, Perú).

## Funcionalidades

- Perfil nutricional del comensal
- Motor de recomendaciones con IA
- Menú digital interactivo con filtros inteligentes
- Sistema de alertas de alérgenos
- Historial de consumo entre sedes
- Programa de fidelización saludable
- Dashboard nutricional personal
- Analítica de consumo para Tanta
- Chatbot nutricionista gastronómico

## Stack tecnológico

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI
- **Base de datos:** Supabase (PostgreSQL)
- **IA:** Groq (LLaMA 3.3)
- **Auth:** Supabase Auth

## Instalación

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Crea un archivo `.env` en `/backend`:

```env
SUPABASE_URL=tu_url ()
SUPABASE_KEY=tu_key ()
GROQ_API_KEY=tu_key ()
```

Inicia el servidor:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Crea un archivo `.env` en `/frontend`:

```env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
VITE_API_URL=http://localhost:8000
```

Inicia el frontend:

```bash
npm run dev
```

## Equipo

- Desarrollado con GastroMind AI Team
