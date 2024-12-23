import re

def creole_to_markdown(creole_text):
    # Headings
    creole_text = re.sub(r'^\s*(=+)\s*(.*?)\s*(=+)\s*$', r'#\2', creole_text, flags=re.MULTILINE)

    # Bold and italic text
    creole_text = re.sub(r'\*\*(.*?)\*\*', r'**\1**', creole_text)  # Bold
    creole_text = re.sub(r'\'\'\'(.*?)\'\'\'', r'***\1***', creole_text)  # Bold + Italic
    creole_text = re.sub(r'\'\'(.*?)\'\'', r'*\1*', creole_text)  # Italic

    # Unordered lists
    creole_text = re.sub(r'^\s*\*\s+(.*?)(?=\n\S)', r'- \1', creole_text, flags=re.MULTILINE)

    # Ordered lists
    creole_text = re.sub(r'^\s*#\s+(.*?)(?=\n\S)', r'1. \1', creole_text, flags=re.MULTILINE)

    # Links
    creole_text = re.sub(r'\[\[(.*?)\|?(.*?)\]\]', r'[\2](\1)', creole_text)  # Internal links
    creole_text = re.sub(r'\[(.*?)\]', r'[\1]', creole_text)  # External links

    # Convert horizontal rules
    # creole_text = re.sub(r'^\s*-{4,}\s*$', r'---', creole_text, flags=re.MULTILINE)

    return creole_text.strip()

# Example usage
if __name__ == "__main__":
    input_file = 'input.creole'
    output_file = 'output.md'

    with open(input_file, 'r') as f:
        creole_content = f.read()

    markdown_content = creole_to_markdown(creole_content)

    with open(output_file, 'w') as f:
        f.write(markdown_content)
