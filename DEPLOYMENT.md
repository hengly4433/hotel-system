# Deployment Guide

This project consists of three main parts that need to be deployed:

1.  **Backend (Spring Boot)**
2.  **Database (PostgreSQL)**
3.  **Frontends (Next.js Admin & Storefront)**

---

## 1. Deploying the Backend (Spring Boot)

Since this is a Java/Spring Boot app, **do not use Vercel**. Use **Railway** or **Render**.

### Option A: Render (Step-by-Step Guide)

We will deploy both the database and the backend on Render.

#### Phase 1: Create the Database

1.  Log in to [Render.com](https://render.com/).
2.  Click **New +** -> **PostgreSQL**.
3.  Fill in the details:
    - **Name:** `hotel-db` (or any name you like)
    - **Database:** `hotel_system`
    - **User:** `hotel_user`
    - **Region:** Choose the region closest to you (e.g., Singapore, Oregon).
    - **Tier:** Select **Free** (if available) or the cheapest paid tier.
4.  Click **Create Database**.
5.  Wait for it to be created.
6.  Scroll down to the **Connections** section.
    - **IMPORTANT:** Copy the `Internal Connection String` (it starts with `postgres://...`). You will need this for the next step.

#### Phase 2: Create the Backend Web Service

1.  Go to Dashboard -> **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  Configure the service:
    - **Name:** `hotel-backend`
    - **Region:** **MUST** be the same as your database.
    - **Branch:** `main`
    - **Root Directory:** `.` (Leave as default / repo root).
      - _Why?_ Because your `backend/Dockerfile` needs to access the `db/` folder in the root, so the build context must be the root.
    - **Runtime:** **Docker**.
    - **Dockerfile Path:** `backend/Dockerfile`.
    - **Instance Type:** Free (if available) or Starter.

4.  **Environment Variables** (Click "Advanced"):
    Add the following keys and values:

    | Key                          | Value                                                                                           |
    | :--------------------------- | :---------------------------------------------------------------------------------------------- |
    | `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://<HOSTNAME>:5432/<DB_NAME>` <br>_(See below for how to get this from Render)_ |
    | `SPRING_DATASOURCE_USERNAME` | The database user from Phase 1.                                                                 |
    | `SPRING_DATASOURCE_PASSWORD` | The database password from Phase 1.                                                             |
    | `APP_STOREFRONT_BASE_URL`    | `https://your-frontend-url.vercel.app` (You can add this later).                                |
    | `PORT`                       | `8080` (This tells Render which port to check for health).                                      |

    **How to format `SPRING_DATASOURCE_URL`:**
    Render gives you an `Internal Connection String` looking like:
    `postgres://user:password@dpg-xxxx-a:5432/hotel_system`

    You need to change it to:
    `jdbc:postgresql://dpg-xxxx-a:5432/hotel_system`
    _(Replace `postgres://` with `jdbc:postgresql://` and remove the `user:password@` part since we provide those in separate variables)._

5.  Click **Create Web Service**.

#### Phase 3: Verify Deployment

1.  Render will start building your Docker image. This might take 5-10 minutes.
2.  Watch the logs. You should see "BUILD SUCCESSFUL" eventually.
3.  Once deployed, Render will provide a URL (e.g., `https://hotel-backend.onrender.com`).
4.  Visit `https://hotel-backend.onrender.com/actuator/health` in your browser.
    - If you see `{"status":"UP"}`, you are live! 🎉

### Option B: Railway (Alternative)

1.  Go to [Railway.app](https://railway.app/).
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select your repository.
4.  **Important:** Configure the build instantly:
    - **Root Directory:** Leave as `/` (Root) because the Dockerfile needs access to `db/`.
    - **Docker Path:** `backend/Dockerfile`.
5.  Railway will detect the Dockerfile and start building.
6.  **Environment Variables:** Add `POSTGRES_URL` (see Database section below) and other variables from `backend/.env`.

---

## 2. Deploying the Frontends (Next.js)

**Vercel** is the best platform for deploying the Next.js apps.

### Admin App (`apps/admin`)

1.  Go to [Vercel](https://vercel.com/).
2.  **Import Project** -> Select your repo.
3.  **Framework Preset:** Next.js.
4.  **Root Directory:** Edit this -> Select `apps/admin`.
5.  **Environment Variables:** Copy from `apps/admin/.env`.
    - `BACKEND_BASE_URL`: The URL of your deployed backend (e.g., `https://hotel-backend.onrender.com`).

### Storefront App (`apps/storefront`)

1.  Import the **same repo again** in Vercel.
2.  **Framework Preset:** Next.js.
3.  **Root Directory:** Edit this -> Select `apps/storefront`.
4.  **Environment Variables:** Copy from `apps/storefront/.env`.
    - `BACKEND_BASE_URL`: The URL of your deployed backend.

---

## 3. Automated Deployment (Render Blueprint)

We have added a `render.yaml` file to the repository. This allows you to deploy the **Database**, **Backend**, **Admin**, and **Storefront** all at once on Render.

### Steps:

1.  Log in to [Render](https://render.com/).
2.  Click **New +** -> **Blueprint**.
3.  Connect your repository (`hengly4433/hotel-system`).
4.  Render will read the `render.yaml` file and show you the services it will create:
    - `hotel-db` (PostgreSQL)
    - `hotel-backend` (Docker)
    - `hotel-admin` (Docker)
    - `hotel-storefront` (Docker)
5.  **Fill in the Environment Variables:**
    Render will ask for values that cannot be auto-generated. You must provide:
    - `APP_AUTH_GOOGLE_CLIENT_ID`
    - `APP_AUTH_GOOGLE_CLIENT_SECRET`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_KEY`
    - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
6.  Click **Apply Blueprint**.
7.  Wait for deployment to finish.

> **Note:** If you prefer Vercel for frontends (recommended for performance), you can delete the `hotel-admin` and `hotel-storefront` sections from `render.yaml` before deploying, or simply delete those services from the Render dashboard after they are created.
