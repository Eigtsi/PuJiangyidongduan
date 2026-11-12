export function setRemUnit() {
  const width = Math.min(document.documentElement.clientWidth || 375, 750)
  document.documentElement.style.fontSize = `${width / 7.5}px`
}
