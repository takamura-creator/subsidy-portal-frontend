type WizardEvent = {
  event: string;
  step: number;
  stepLabel: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

const _eventLog: WizardEvent[] = [];

export function trackStepEnter(step: number, stepLabel: string): void {
  _eventLog.push({
    event: "wizard_step_enter",
    step,
    stepLabel,
    timestamp: Date.now(),
  });
}

export function trackStepComplete(step: number, stepLabel: string): void {
  _eventLog.push({
    event: "wizard_step_complete",
    step,
    stepLabel,
    timestamp: Date.now(),
  });
}

export function trackDrillDownSkip(skipCount: number): void {
  _eventLog.push({
    event: "drill_down_skip",
    step: 6,
    stepLabel: "深掘り質問",
    timestamp: Date.now(),
    metadata: { skipCount },
  });
}

export function trackDocumentDownload(fileCount: number): void {
  _eventLog.push({
    event: "document_download",
    step: 9,
    stepLabel: "プレビュー",
    timestamp: Date.now(),
    metadata: { fileCount },
  });
}

export function getWizardDuration(): number | null {
  const enters = _eventLog.filter(e => e.event === "wizard_step_enter");
  if (enters.length < 2) return null;
  return enters[enters.length - 1].timestamp - enters[0].timestamp;
}

export function getEventLog(): readonly WizardEvent[] {
  return _eventLog;
}

/** FV 地域選択イベント（diagnosis_start）。既存4イベントと非重複。 */
export function trackDiagnosisStart(prefecture: string): void {
  _eventLog.push({
    event: "diagnosis_start",
    step: 0,
    stepLabel: "FV地域選択",
    timestamp: Date.now(),
    metadata: { prefecture },
  });
}
