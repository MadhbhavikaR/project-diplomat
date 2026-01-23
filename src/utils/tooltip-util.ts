export const getTooltipText = (text: string, maxLength = 80): string => {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength)}…`
}
