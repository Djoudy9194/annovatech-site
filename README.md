## AnnovaTech

Sitio estatico HTML/CSS/JS preparado para captacion de leads, SEO tecnico y deployment profesional.

## Estructura

- index.html: home y formulario principal.
- contacto.html: pagina principal de captacion.
- servicios.html: servicios comerciales.
- portafolio.html: portafolio conceptual.
- blog.html: indice estatico del blog.
- blog/: articulos estaticos indexables.
- pages/gracias.html: confirmacion post-envio, no indexable.
- pages/politicas.html: politica de privacidad.
- assets/css/: estilos globales y de paginas.
- assets/js/site-config.js: configuracion central del sitio.
- assets/js/tracking.js: eventos dataLayer.
- assets/js/form.js: validacion y envio de formularios.

## Formularios

El proyecto queda preparado para Netlify Forms por defecto.

- Los formularios usan name="contacto", data-netlify="true" y el hidden form-name correspondiente.
- La validacion y el envio AJAX viven en assets/js/form.js.
- El evento de exito dispara form_submit_success.
- El evento de error dispara form_submit_error.

### Netlify

No requiere cambios extra si se despliega el sitio completo en Netlify.

### Vercel u otro hosting estatico

El sitio puede desplegarse como estatico, pero la captacion por formularios de esta version queda preparada especificamente para Netlify Forms.
Si se despliega fuera de Netlify, habra que implementar otra integracion de formularios.

## Tracking

El archivo assets/js/tracking.js empuja eventos al dataLayer sin duplicarlos por tipo:

- whatsapp_click
- cta_click
- form_submit_success
- form_submit_error

Se recomienda mapear estos eventos en Google Tag Manager hacia GA4 y conversiones.

## SEO

- Sitemap actualizado en sitemap.xml.
- Robots actualizado en robots.txt.
- Blog migrado a URLs HTML estaticas.
- OG image en PNG: assets/images/branding/og-image.png.
- Canonicals y metadata unificados.
- Correo oficial unificado: contacto@annovatech.cl.

## Deployment

Se incluyen configuraciones base para:

- Netlify: netlify.toml
- Vercel: vercel.json

Ambas incluyen headers basicos de seguridad y cache.

## Mantenimiento

### Publicar un nuevo articulo

1. Crea un nuevo archivo HTML dentro de blog/.
2. Agregalo manualmente a blog.html.
3. Agregalo a sitemap.xml.
4. Revisa title, description, canonical y OG.

### Cambiar datos comerciales

Actualiza en una sola pasada:

- assets/js/site-config.js
- schema en HTML relevantes
- footers y pagina de contacto

## Recomendaciones operativas

- Validar el formulario en dominio final antes de lanzar campañas.
- Configurar eventos de conversion en GTM y GA4.
- Si el deploy final no se hace en Netlify, reemplazar la integracion del formulario antes de lanzar trafico.
- Revisar Search Console luego del deploy.
