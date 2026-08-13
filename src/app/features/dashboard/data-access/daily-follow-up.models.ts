export interface DailyFollowUpQuery {
  fechaDesde: string;
  fechaHasta: string;
}

export interface DailyFollowUpApiItem {
  fechaSeguimiento: string;
  diaSeguimiento: string;
  totalEntre15y20: number;
  totalEntre7y15: number;
  totalGuiasMayorA2Dias: number;
  totalMayorA20: number;
  sumaTotal: number;
  totalAcumulado: number;
}

export interface DailyFollowUpRow {
  fechaSeguimiento: string;
  fechaSeguimientoDate: Date;
  fechaSeguimientoLabel: string;
  fechaSeguimientoShortLabel: string;
  diaSeguimiento: string;
  diaSeguimientoLabel: string;
  totalEntre15y20: number;
  totalEntre7y15: number;
  totalGuiasMayorA2Dias: number;
  totalMayorA20: number;
  promedio: number;
  totalAcumulado: number;
}
