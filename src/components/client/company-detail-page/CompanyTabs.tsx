// components/client/company-detail-page/CompanyTabs.tsx
interface Tab {
  key: string
  label: string
  count?: number | null
}

interface CompanyTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Tab[]
}

export default function CompanyTabs({ activeTab, onTabChange, tabs }: CompanyTabsProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === tab.key
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count !== undefined && (
                <span className="ml-2 bg-neutral-100 text-neutral-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}