import 'i18next';

// Import All Namespaces (for the default language only)
import common from '../public/locales/common/en.json';
import gallery from '../public/locales/gallery/en.json';
import hotkeys from '../public/locales/hotkeys/en.json';
import modelmanager from '../public/locales/modelmanager/en.json';
import parameters from '../public/locales/parameters/en.json';
import settings from '../public/locales/settings/en.json';
import toast from '../public/locales/toast/en.json';
import tooltip from '../public/locales/tooltip/en.json';
import unifiedcanvas from '../public/locales/unifiedcanvas/en.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // Setting Default Namespace As English
    defaultNS: 'en';
    // Custom Types For Resources
    resources: {
      common: typeof common;
      unifiedcanvas: typeof unifiedcanvas;
      parameters: typeof parameters;
      gallery: typeof gallery;
      toast: typeof toast;
      hotkeys: typeof hotkeys;
      settings: typeof settings;
      tooltip: typeof tooltip;
      modelmanager: typeof modelmanager;
    };
    // Never Return Null
    returnNull: false;
  }
}
