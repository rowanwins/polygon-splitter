export function compareEdges(edge1, edge2) {
  if (edge1.minX > edge2.minX) return 1
  if (edge1.minX < edge2.minX) return -1

  if (edge1.minY > edge2.minY) return 1
  if (edge1.minY < edge2.minY) return -1
  return 1
}

export function compareIpLocations(ip, ip2, edgeStart) {
  var a = ip[0] - edgeStart[0]
  var b = ip[1] - edgeStart[1]
  var distanceIp = Math.sqrt((a * a) + (b * b))

  var a2 = ip2[0] - edgeStart[0]
  var b2 = ip2[1] - edgeStart[1]
  var distanceIp2 = Math.sqrt((a2 * a2) + (b2 * b2))

  if (distanceIp < distanceIp2) return true
  return false
}
