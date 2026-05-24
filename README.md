# La Mola · TV Serveis

Kiosk web per a la smart TV del coffee corner de CrossFit La Mola.
Mostra un carrusel de serveis (fisio, nutrició, mobilitat) i merchandising
amb codis QR a WhatsApp per agendar visites.

## Estructura

- `index.html` — display TV (kiosk fullscreen)
- `admin.html` — panell admin per editar serveis i publicar a GitHub
- `services.json` — dades (professionals, merch)
- `config.json` — paràmetres de carrusel i visualització
- `media/` — fotos, vídeos i logos

## Edició

Obrir `/admin.html` al navegador. La primera vegada demana token de GitHub
amb scope `repo`. Després només cal editar, previsualitzar i publicar.

## TV

Apuntar el navegador en mode kiosk a la URL de GitHub Pages.
Chrome: `chrome --kiosk --noerrdialogs --disable-session-crashed-bubble https://...`
