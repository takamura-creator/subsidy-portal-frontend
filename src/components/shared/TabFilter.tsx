"use client";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabFilterProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function TabFilter({ tabs, activeTab, onChange }: TabFilterProps) {
  return (
    <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto" role="tablist" aria-label="フィルタ">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-text2 hover:text-text hover:border-border"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? "bg-primary/10" : "bg-bg-surface"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
