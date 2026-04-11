"use client";

const REGIONS: { name: string; prefectures: string[] }[] = [
  {
    name: "北海道・東北",
    prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    name: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    name: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県"],
  },
  {
    name: "近畿",
    prefectures: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    name: "中国・四国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    name: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
];

interface AreaSelectorProps {
  selected: string[];
  onChange: (areas: string[]) => void;
}

export default function AreaSelector({ selected, onChange }: AreaSelectorProps) {
  function togglePref(pref: string) {
    if (selected.includes(pref)) {
      onChange(selected.filter((s) => s !== pref));
    } else {
      onChange([...selected, pref]);
    }
  }

  function selectAllRegion(prefectures: string[]) {
    const allSelected = prefectures.every((p) => selected.includes(p));
    if (allSelected) {
      onChange(selected.filter((s) => !prefectures.includes(s)));
    } else {
      const merged = new Set([...selected, ...prefectures]);
      onChange(Array.from(merged));
    }
  }

  return (
    <div className="space-y-4">
      {REGIONS.map((region) => {
        const allChecked = region.prefectures.every((p) => selected.includes(p));
        const someChecked = region.prefectures.some((p) => selected.includes(p));

        return (
          <div key={region.name}>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium text-text">{region.name}</h4>
              <button
                type="button"
                onClick={() => selectAllRegion(region.prefectures)}
                className="text-xs text-primary hover:underline"
              >
                {allChecked ? "すべて解除" : "すべて選択"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {region.prefectures.map((pref) => {
                const isSelected = selected.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePref(pref)}
                    className={`px-3 py-1.5 text-xs rounded-[10px] border transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-bg-card border-border text-text2 hover:border-text2"
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-text2">
        選択中: {selected.length}件
        {selected.length === 0 && "（1つ以上選択してください）"}
      </p>
    </div>
  );
}
