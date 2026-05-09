/** GET /api/v1/settings data */
export interface UserSettingsPayload {
  retroEnabled: boolean
  statsEnabled: boolean
  inspectionDay: string
}

/** PUT /api/v1/settings — 字段缺省表示不改 */
export interface UpdateUserSettingsBody {
  retroEnabled?: boolean
  statsEnabled?: boolean
  inspectionDay?: string
}

/** 与后端 inspection_day CHECK 一致 */
export const INSPECTION_DAY_OPTIONS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const

export type InspectionDayOption = (typeof INSPECTION_DAY_OPTIONS)[number]
