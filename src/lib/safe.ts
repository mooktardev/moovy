/**
 * Exécute une promesse sans faire échouer la page en cas d'erreur API :
 * renvoie null et journalise l'erreur, à la place.
 */
export async function safe<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error(error);
    return null;
  }
}
