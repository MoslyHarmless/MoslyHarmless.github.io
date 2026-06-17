const translations = {
  en: {
    title: "Offer AI: Premium Resume Builder",
    nav_features: "Features",
    nav_templates: "Templates",
    nav_privacy: "Privacy",
    hero_title: "Build your premium resume in minutes.",
    hero_subtitle: "The ultimate career studio. Generate ATS-friendly resumes, cover letters, and track your success with AI.",
    btn_get_app: "Get it on Google Play",
    btn_web_version: "Web Version",
    features_title: "Unfair Advantage.",
    features_subtitle: "Everything you need to land your dream job, packed into one beautiful app.",
    feat_1_title: "AI Generation",
    feat_1_desc: "Instantly craft professional summaries and experience bullet points using cutting-edge AI.",
    feat_2_title: "ATS Matching",
    feat_2_desc: "Upload a job description and automatically tailor your resume to score 90%+ in ATS systems.",
    feat_3_title: "Smart Export",
    feat_3_desc: "Export to beautiful, pixel-perfect PDFs or share a premium web link with recruiters instantly.",
    templates_title: "Premium Templates.",
    templates_desc: "Stand out from the crowd with gorgeous, HR-approved designs built right into the app. Easily switch styles with a single tap.",
    btn_get_app_small: "Get the App",
    footer_rights: "© 2026 Offer AI. All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_contact: "Contact"
  },
  ru: {
    title: "Offer AI: Премиум Резюме",
    nav_features: "Возможности",
    nav_templates: "Шаблоны",
    nav_privacy: "Конфиденциальность",
    hero_title: "Создайте премиальное резюме за минуты.",
    hero_subtitle: "Идеальная карьерная студия. Генерируйте резюме и сопроводительные письма с помощью ИИ, которые проходят ATS-системы.",
    btn_get_app: "Скачать в Google Play",
    btn_web_version: "Веб-версия",
    features_title: "Нечестное преимущество.",
    features_subtitle: "Всё, что нужно для получения работы мечты, собрано в одном красивом приложении.",
    feat_1_title: "Генерация с ИИ",
    feat_1_desc: "Мгновенно создавайте профессиональные описания опыта и навыки с помощью передового ИИ.",
    feat_2_title: "ATS Совпадение",
    feat_2_desc: "Загрузите описание вакансии и автоматически адаптируйте резюме, чтобы получить 90%+ в ATS-системах.",
    feat_3_title: "Умный экспорт",
    feat_3_desc: "Экспортируйте красивые PDF-файлы или делитесь премиальной веб-ссылкой с рекрутерами.",
    templates_title: "Премиум Шаблоны.",
    templates_desc: "Выделяйтесь из толпы благодаря великолепным дизайнам, одобренным HR. Меняйте стили в один клик.",
    btn_get_app_small: "Скачать приложение",
    footer_rights: "© 2026 Offer AI. Все права защищены.",
    footer_privacy: "Конфиденциальность",
    footer_contact: "Контакты"
  },
  uk: {
    title: "Offer AI: Преміум Резюме",
    nav_features: "Можливості",
    nav_templates: "Шаблони",
    nav_privacy: "Конфіденційність",
    hero_title: "Створіть преміальне резюме за хвилини.",
    hero_subtitle: "Ідеальна кар'єрна студія. Генеруйте резюме та супровідні листи за допомогою ШІ, що проходять ATS-системи.",
    btn_get_app: "Завантажити в Google Play",
    btn_web_version: "Веб-версія",
    features_title: "Нечесна перевага.",
    features_subtitle: "Все, що потрібно для отримання роботи мрії, зібрано в одному красивому додатку.",
    feat_1_title: "Генерація з ШІ",
    feat_1_desc: "Миттєво створюйте професійні описи досвіду та навички за допомогою передового ШІ.",
    feat_2_title: "ATS Збіг",
    feat_2_desc: "Завантажте опис вакансії та автоматично адаптуйте резюме, щоб отримати 90%+ у ATS-системах.",
    feat_3_title: "Розумний експорт",
    feat_3_desc: "Експортуйте красиві PDF-файли або діліться преміальним веб-посиланням з рекрутерами.",
    templates_title: "Преміум Шаблони.",
    templates_desc: "Виділяйтеся з натовпу завдяки чудовим дизайнам, схваленим HR. Змінюйте стилі в один клік.",
    btn_get_app_small: "Завантажити додаток",
    footer_rights: "© 2026 Offer AI. Всі права захищені.",
    footer_privacy: "Конфіденційність",
    footer_contact: "Контакти"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('lang-selector');
  const savedLang = localStorage.getItem('site_lang') || 'en';
  
  if (selector) {
    selector.value = savedLang;
    setLanguage(savedLang);

    selector.addEventListener('change', (e) => {
      const newLang = e.target.value;
      setLanguage(newLang);
      localStorage.setItem('site_lang', newLang);
    });
  }
});

function setLanguage(lang) {
  const dict = translations[lang] || translations['en'];
  
  // Update texts
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'TITLE') {
        document.title = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Optional: Update html lang attribute
  document.documentElement.lang = lang;
}
