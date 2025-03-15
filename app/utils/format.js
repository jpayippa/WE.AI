export function formatMessage(text) {
    // 1. Replace markdown links [text](url) with anchor tags
    let replacedMarkdown = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline">$1</a>'
    );
  
    // 2. Split into lines
    const lines = replacedMarkdown.split('\n');
    let output = '';
    let inList = false;
  
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
  
      // Detect list items
      const match = trimmed.match(/^-\s*\*\*(.*?)\*\*:\s*(.*)$/);
      if (match) {
        if (!inList) {
          output += '<ul class="list-disc pl-5 space-y-2 my-2">';
          inList = true;
        }
        const heading = match[1];
        const content = match[2];
        output += `<li><strong class="text-purple-300">${heading}</strong>: ${content}</li>`;
      } else {
        if (inList) {
          output += '</ul>';
          inList = false;
        }
        output += `<p class="my-2">${trimmed}</p>`;
      }
    });
  
    if (inList) output += '</ul>';
    
    return output;
  }