/**
 * Service d'orchestration de l'impression papier locale
 */
export class PrintService {
  /**
   * Déclenche l'impression de la page courante avec les styles CSS d'impression
   */
  public static printPage(): void {
    if (typeof window === 'undefined') {
      return
    }

    // Déclenchement de la boîte de dialogue d'impression native du navigateur
    window.print()
  }
}
