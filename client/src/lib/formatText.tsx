export function formatBoldText(text: string): (string | JSX.Element)[] {
  const parts = text.split(/(\*[^*]+\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const boldText = part.slice(1, -1);
      return <strong key={index}>{boldText}</strong>;
    }
    return part;
  });
}
