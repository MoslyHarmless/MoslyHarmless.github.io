# CLAUDE.md — MoslyHarmless.github.io

Сайт приложения **Offer AI** (конструктор резюме с ИИ для Android, пакет `com.maksymkasianov.offerai`). Это пользовательский сайт GitHub Pages: репозиторий `MoslyHarmless/MoslyHarmless.github.io`, ветка `main`, адрес `https://moslyharmless.github.io/`.

Чистые HTML, CSS и JS, без сборки. С владельцем общаться по-русски.

## Где что лежит

| Путь | Что это |
|---|---|
| `index.html` | Лендинг приложения |
| `create-resume.html` | Страница создания резюме в браузере |
| `privacy.html` | Политика конфиденциальности. На неё ссылается карточка в Google Play — адрес менять нельзя |
| `styles.css`, `script.js` | Общие стили и логика |
| `site-config.js` | Конфиг `window.OFFER_AI_SITE_CONFIG`: ссылка на Google Play, адрес политики, почта, `formEndpoint`, `backendBaseUrl`, `builderAccessToken` |
| `app-ads.txt` | Файл для рекламных сетей (AdMob). Должен лежать в корне домена, содержимое не менять без владельца |
| `assets/` | Картинки |

Связанные проекты: бэкенд — `../cv-builder-backend`; портфолио автора — `../cv-portfolio`.

## Команды

```bash
python -m http.server 8080    # http://localhost:8080
```

Выкладка — push в `main`, GitHub Pages обновляется сам.

## Правила

- `site-config.js` публичен: всё, что в нём лежит, видно любому посетителю. Не клади туда секретные ключи. Сейчас `backendBaseUrl` и `builderAccessToken` пустые — если владелец просит их заполнить, предупреди, что значение станет публичным.
- Текст `privacy.html` — юридический: менять только по прямой просьбе и не выдумывать формулировки.
- Не переименовывать `privacy.html` и `app-ads.txt`.
- Ссылки на магазин брать из `site-config.js`, а не вписывать в разметку.

## Скилы

Проектных скилов нет: сборки и тестов в репозитории нет.

Установленные, которые здесь уместны:
- `searchfit-seo:seo-check`, `searchfit-seo:on-page-seo`, `searchfit-seo:schema-markup` — SEO лендинга (разметка SoftwareApplication).
- `design:design-critique`, `design:accessibility-review`, `design:ux-copy` — вёрстка, доступность, тексты.
- `marketing:draft-content` — тексты лендинга.
- `run` — открыть сайт в браузере и проверить правку.
