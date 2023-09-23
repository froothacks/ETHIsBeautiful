import json
from collections import defaultdict

# Load the JSON file
filename = 'data_150k_lines.json'

with open(filename, 'r') as file:
    data = json.load(file)

# Initialize a dictionary to hold the count of each node's occurrence in the links
node_count = defaultdict(int)

# Count the occurrences of each node in the links
for link in data['links']:
    node_count[link['source']] += 1
    node_count[link['target']] += 1

# Initialize new lists to hold the pruned nodes and links
pruned_nodes = []
pruned_links = []

threshold = 5

# Add nodes to the pruned_nodes list only if they appear more than once in the links
for node in data['nodes']:
    node_id = node['id']
    if node_count[node_id] > threshold:
        pruned_nodes.append(node)

# Add links to the pruned_links list only if both source and target appear more than once in the links
for link in data['links']:
    if node_count[link['source']] > threshold and node_count[link['target']] > threshold:
        pruned_links.append(link)

# Update the data dictionary with the pruned nodes and links
data['nodes'] = pruned_nodes
data['links'] = pruned_links

# Save the pruned data back to a JSON file
with open('pruned_hard2_' + filename, 'w') as file:
    json.dump(data, file, indent=4)  # Use indent to pretty-print the JSON
