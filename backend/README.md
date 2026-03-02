## Recuperación de contraseña (OTP)

Esta funcionalidad usa Resend en modo testing (`onboarding@resend.dev`).

### Limitación actual
Sin dominio verificado en Resend, solo se pueden enviar correos OTP al correo dueño de la cuenta Resend.

### Correo habilitado para pruebas
- `juanpabloprox003@gmail.com`

Si pruebas con otros correos, el backend responderá error de envío por restricción del proveedor.

### Para habilitar todos los correos en producción
1. Verificar un dominio en Resend.
2. Configurar `RESEND_FROM` con ese dominio (ej: `no-reply@tudominio.com`).
3. Regenerar `RESEND_API_KEY` y actualizar `.env`.
