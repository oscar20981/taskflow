# Flujo de trabajo en GitHub (HU-15)

Esto lo deben hacer **ambos aprendices desde su propia cuenta**: el historial debe reflejar quién hizo qué.

## 1. Subir el proyecto
```bash
git add -A && git commit -m "feat: reorganiza backend en capas, error simulado y documentación"
git remote add origin https://github.com/<usuario>/taskflow.git
git branch -M main && git push -u origin main
```
Invita a la otra persona (Settings → Collaborators) y protege `main` (Settings → Branches → exigir Pull Request).

## 2. Issues
Con [GitHub CLI](https://cli.github.com) autenticado (`gh auth login`): `node scripts/crear-issues.mjs` crea un Issue por historia de usuario. Asigna cada uno a su responsable.

## 3. Ramas y Pull Requests
Una rama por Issue: `feature/hu-05-worker`, `fix/hu-08-cache`, `docs/hu-15-pruebas`…
```bash
git switch -c feature/hu-05-worker
git commit -m "feat(worker): procesa solicitudes desde la cola (#5)"
git push -u origin feature/hu-05-worker   # y abrir el Pull Request
```
Cada PR lo **revisa la otra persona** (comentarios + aprobación) antes de fusionar. Usa la plantilla `.github/pull_request_template.md`.

## 4. Entrega
Completa los integrantes en el `README.md` y entrega el enlace del repositorio junto con `docs/PRUEBAS.md` y sus pantallazos.
