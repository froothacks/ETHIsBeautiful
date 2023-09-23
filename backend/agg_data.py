import json
from collections import defaultdict

filename = "pruned_hard4_monster_data_800k.json"
# Suppose 'data.json' contains your graph data
with open(filename, 'r') as f:
    graph = json.load(f)

# Dictionary to hold the aggregated links
aggregated_links = defaultdict(list)

# Aggregate the links
for link in graph['links']:
    key = (link['source'], link['target'])
    aggregated_links[key].append({'timestamp': link['timestamp'], 'value': link['value']})

# Create the new graph with aggregated links
new_graph = {
    'nodes': graph['nodes'],
    'links': [{'source': source, 'target': target, 'data': data} for (source, target), data in aggregated_links.items()]
}

# Output the new graph, for example, as JSON
# print(json.dumps(new_graph, indent=2))

# Save the pruned data back to a JSON file
with open('agg_hard_' + filename, 'w') as file:
    json.dump(new_graph, file, indent=2)  # Use indent to pretty-print the JSON
