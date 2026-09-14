export const nextId = (arreglo) => {
  return arreglo.length > 0 
    ? Math.max(...arreglo.map(item => item.id)) + 1 
    : 1;
};