import re

with open('d:/ScoutIT/frontend/src/lib/mock-data.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_city = None
new_lines = []

for i, line in enumerate(lines):
    if line.strip().startswith('//'):
        current_city = line.strip().replace('//', '').strip()
        new_lines.append(line)
        continue
    
    if current_city and '{ id:' in line:
        # insert city inside the object
        line = line.replace('{ id:', f'{{ city: "{current_city}", id:')
    
    new_lines.append(line)

with open('d:/ScoutIT/frontend/src/lib/mock-data.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
