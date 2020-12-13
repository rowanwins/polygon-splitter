export function compareEdges(edge1, edge2) {
  if (edge1.minX > edge2.minX) return 1
  if (edge1.minX < edge2.minX) return -1

  if (edge1.minY > edge2.minY) return 1
  if (edge1.minY < edge2.minY) return -1
  return 1
}
