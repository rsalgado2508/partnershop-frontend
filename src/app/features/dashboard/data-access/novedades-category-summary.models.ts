export interface NovedadCategorySummaryItem {
  nombre: string;
  total: number;
}

export interface NovedadesCategorySummary {
  guiasMayorA2Dias: NovedadCategorySummaryItem[];
  mayorA20Dias: NovedadCategorySummaryItem[];
}
