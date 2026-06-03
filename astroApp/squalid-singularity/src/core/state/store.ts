import type { CoreState } from "../domain/types";

export interface CoreStore {
  getState(): CoreState;
  /**
   * Actualiza el estado a partir del estado anterior.
   * Notifica a todos los suscriptores después del cambio.
   */
  setState(updater: (prev: CoreState) => CoreState): void;
  /**
   * Suscribe un listener a cambios de estado.
   * Devuelve una función para desuscribirse.
   */
  subscribe(listener: (state: CoreState) => void): () => void;
}

export function createCoreStore(initialState: CoreState): CoreStore {
  let state = initialState;
  const listeners = new Set<(state: CoreState) => void>();

  const getState = () => state;

  const setState: CoreStore["setState"] = updater => {
    const next = updater(state);
    // Evitar notificaciones innecesarias si no cambia la referencia
    if (next === state) return;
    state = next;
    listeners.forEach(listener => listener(state));
  };

  const subscribe: CoreStore["subscribe"] = listener => {
    listeners.add(listener);
    // Devolver función de cleanup
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    setState,
    subscribe
  };
}

