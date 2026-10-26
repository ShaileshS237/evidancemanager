import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import './index.css';
import './styles/book.scss';

// StrictMode is omitted: react-pageflip does not tolerate double mounting.
createRoot(document.getElementById('root')!).render(
    <I18nProvider>
        <App />
    </I18nProvider>,
);
