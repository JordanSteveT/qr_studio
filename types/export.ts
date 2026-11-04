export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp'

export type PngResolution = 1024 | 2048 | 4096

export interface PngResolutionOption {
  value: PngResolution
  label: string
  sublabel: string
}

export const PNG_RESOLUTIONS: readonly PngResolutionOption[] = [
  { value: 1024, label: '1024 px', sublabel: 'Standard (Web / Réseaux)' },
  { value: 2048, label: '2048 px', sublabel: 'HD (Recommandé / Print A4)' },
  { value: 4096, label: '4096 px', sublabel: 'UHD (Grands formats / Affiches)' }
] as const

export interface QrExportRequest {
  format: ExportFormat
  data: string
  design: import('./design').QrDesign
  resolution?: PngResolution | undefined
  projectName?: string | undefined
}
