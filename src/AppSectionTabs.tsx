import {appSections, type AppSectionId} from './AppSections';

interface AppSectionTabsProps {
    activeSectionId: AppSectionId;
    onSectionChange: (sectionId: AppSectionId) => void;
}

export function AppSectionTabs({activeSectionId, onSectionChange}: Readonly<AppSectionTabsProps>) {
    return (
        <nav className="section-tabs" aria-label="Application sections">
            {appSections.map((section) => {
                const isActive = section.id === activeSectionId;

                return (
                    <button
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`${section.label}: ${section.description}`}
                        className={isActive ? 'section-tab section-tab--active' : 'section-tab'}
                        key={section.id}
                        onClick={() => onSectionChange(section.id)}
                        title={section.description}
                        type="button"
                    >
                        {section.label}
                    </button>
                );
            })}
        </nav>
    );
}