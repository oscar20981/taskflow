# Prototipo de pantallas — TaskFlow

Boceto de baja fidelidad de las cinco vistas.

**Estructura común:** menú lateral a la izquierda y Navbar superior con el estado de conexión en vivo y el botón "Nueva solicitud". En tableta y móvil el menú lateral se oculta y se abre como panel deslizable con el botón de menú del Navbar.
```
+--------+---------------------------------------------+
| Menú   | [≡] TaskFlow            ● En vivo [Nueva..] |  <- Navbar
| lateral|---------------------------------------------|
|        |  contenido de la vista                      |
+--------+---------------------------------------------+
```

## Dashboard `/`
```
+--------------------------------------------------+
| Dashboard                      [Nueva solicitud] |
| TOTAL: 24      "n en movimiento por el pipeline" |
| [Pend][En cola][Procesando][Respondidas][Error]  |
| Solicitudes recientes                [Ver todas] |
| ID | Solicitud | Categoría | Prior. | Estado |...|
+--------------------------------------------------+
```
## Nueva solicitud `/nueva-solicitud`
```
Título [__________]   Descripción [__________]
Categoría ( Info )( Soporte )( Documento )( Consulta )( Actualización )( Otra )
Prioridad [Baja|Media|Alta]          [Cancelar][Enviar]
```
## Listado `/solicitudes`
```
[ Buscar... ] [Estado v] [Categoría v]     CACHE HIT/MISS
Tabla: solicitud · categoría · prioridad · estado · fecha · [Ver detalle]
```
## Detalle `/solicitudes/:id`
```
PENDIENTE → EN COLA → PROCESANDO → RESPONDIDA   (ERROR en rojo)
Título + estado | Descripción | [ Panel de respuesta ] | Categoría, prioridad, fechas
```
## Monitor `/monitor`
```
[Express][MongoDB][Redis][Worker]   (verde = disponible, rojo = no)
Cola / Procesando / Respondidas / Errores
Eventos en tiempo real: hora · evento · id
```
Colores de estado: PENDIENTE amarillo · EN COLA azul · PROCESANDO morado · RESPONDIDA verde · ERROR rojo.
