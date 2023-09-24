import json
import random

# Read data from 'data.json'
with open('../data/blocks.json', 'r') as f:
    data = json.load(f)

# Limit the number of links to 200
if len(data['links']) > 200:
    data['links'] = data['links'][:200]

# Add a timestamp to each link object
for link in data['links']:
    link['timestamp'] = random.randint(1, 10)

# Remove nodes not referenced in links
referenced_nodes = set()
for link in data['links']:
    referenced_nodes.add(link['source'])
    referenced_nodes.add(link['target'])

data['nodes'] = [node for node in data['nodes'] if node['id'] in referenced_nodes]

# Write the updated data to 'output.json'
with open('../data/output.json', 'w') as f:
    json.dump(data, f, indent=4)
