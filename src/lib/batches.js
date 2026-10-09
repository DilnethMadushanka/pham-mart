// Upserts the saved batch and medicine into app state after a batch change.
export function applyBatchResult(data, { setMedicines, setBatches, setStockMovements }) {
  if (data.medicine) setMedicines(prev => prev.map(m => (m.id === data.medicine.id ? data.medicine : m)));
  if (data.batch) {
    setBatches(prev => (prev.some(b => b.id === data.batch.id)
      ? prev.map(b => (b.id === data.batch.id ? data.batch : b))
      : [...prev, data.batch]));
  }
  if (data.movement && setStockMovements) setStockMovements(prev => [data.movement, ...prev]);
}
