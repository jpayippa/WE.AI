export function formatMessage(text) {
  if (!text) return ""; // Return empty string for empty input

  // Step 1: Replace Markdown links [text](url) with anchor tags
  let formattedText = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline">$1</a>'
  );

  // Step 2: Replace raw URLs with "Click here" links while avoiding double-wrapping
  formattedText = formattedText.replace(
    /(^|[^">])(https?:\/\/[^\s<>"]+[^.,!?()"'\s<>])/g,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline">Click here</a>'
  );

  // Step 3: Convert **bold text** to <strong> tags
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-purple-300">$1</strong>'
  );

  // Step 4: Convert numbered sections (e.g., "1. **Title:**") into <h3> headers
  //         and add a <br> before each heading to ensure it starts on a new line.
  formattedText = formattedText.replace(
    /^(\d+)\.\s*\*\*(.*?)\*\*:/gm,
    '<br><h3 class="text-lg font-bold mt-6 mb-2 text-purple-400">$1. $2</h3>'
  );

  // Step 5: Process bullet points and implicit lists
  const lines = formattedText.split("\n");
  let output = "";
  let inList = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Skip empty lines

    // Handle explicit bullet points (lines starting with "-")
    if (trimmed.startsWith("-")) {
      if (!inList) {
        output += '<div class="pl-6 space-y-1 mt-2">'; // Start bullet list block
        inList = true;
      }
      output += `<p class="my-1">• ${trimmed.substring(1).trim()}</p>`;
    }
    // Handle implicit list items (lines following a header ending with ":")
    else if (
      index > 0 &&
      lines[index - 1].trim().endsWith(":") && // Previous line indicates list header
      !trimmed.match(/^\d+\.\s/) &&            // Exclude numbered sections
      !trimmed.startsWith("<h3")               // Exclude header lines
    ) {
      if (!inList) {
        output += '<div class="pl-6 space-y-1 mt-2">'; // Start bullet list block
        inList = true;
      }
      output += `<p class="my-1">• ${trimmed}</p>`;
    } else {
      // Close the bullet list block if we were in a list
      if (inList) {
        output += "</div>";
        inList = false;
      }
      output += `<p class="my-3">${trimmed}</p>`;
    }
  });

  // Close any open bullet list block
  if (inList) {
    output += "</div>";
  }

  return output;
}