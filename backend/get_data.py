import requests
from collections import deque
import json
import random

global_counter = 0

def get_transactions(address, api_key):
    base_url = "https://api.etherscan.io/api"
    params = {
        "module": "account",
        "action": "txlist",
        "address": address,
        "startblock": "0",
        "endblock": "99999999",
        "sort": "asc",
        "apikey": api_key,
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json().get("result", [])
    else:
        print("NON 200", response.status_code)
        return []

def bfs_eth_address(start_address, api_key, max_depth):
    global global_counter
    # reset counter per seed we work with
    global_counter = 0

    visited_addresses = set([start_address])
    # queue = deque([(start_address, 0)])
    queue = [(start_address, 0)]
    transactions_list = []

    while queue:
        random_index = random.randint(0, len(queue) - 1)  # Get a random index
        address, depth = queue.pop(random_index)  # Pop and get the item at the random index
        print("depth", depth)

        # address, depth = queue.popleft()

        # if depth >= max_depth:
        #     continue

        transactions = get_transactions(address, api_key)
        # truncate transactions to first x for each account
        TRANSACTIONS_LIMIT = 10
        # transactions = transactions[0:x]
        CURRENT_NODE_TRANSACTIONS_LIMIT = 500
        transactions = transactions[0:CURRENT_NODE_TRANSACTIONS_LIMIT]
        for idx, tx in enumerate(transactions):
            try:
                from_address = tx['from']
                to_address = tx['to']
                amount = tx['value']
                timestamp = tx['timeStamp']
            except TypeError:
                continue

            transactions_list.append({
                'from': from_address,
                'to': to_address,
                'amount': amount,
                'timestamp': timestamp
            })
            global_counter += 1
            if global_counter % 1000 == 0:
                # print(json.dumps(transactions_list, indent=2))
                print("COUNTER", global_counter)

            # if global_counter >= 1000:
            #     print("HIT X, MOVING ON")
            #     print("*" * 100)
            #     return transactions_list

            if len(visited_addresses) >= 100:
                print("HIT 100 visited addresses, MOVING ON")
                print("*" * 100)
                return transactions_list

            if to_address not in visited_addresses and idx < TRANSACTIONS_LIMIT:
                visited_addresses.add(to_address)
                queue.append((to_address, depth + 1))
                
    return transactions_list


def convert_to_addr_dict(data):
    transactions_by_address = {}

    for transaction in data:
        from_address = transaction['from']
        to_address = transaction['to']
        
        # Handle 'from' address
        if from_address not in transactions_by_address:
            transactions_by_address[from_address] = [transaction]
        else:
            transactions_by_address[from_address].append(transaction)
        
        # Handle 'to' address
        if to_address not in transactions_by_address:
            transactions_by_address[to_address] = [transaction]
        else:
            transactions_by_address[to_address].append(transaction)

    print(json.dumps(transactions_by_address, indent=2))
    
    nodes = [{"id": x, "user": x} for x in transactions_by_address]
    links = [{"source": tx["from"], "target": tx["to"]} for tx in data]

    combined = {"nodes": nodes, "links": links}
    print("NODES AND LINKS")
    print("-" * 100)
    print(json.dumps(combined, indent=2))

    file_name = "prettified.json"

    with open(file_name, 'w') as f:
        json.dump(combined, f, indent=2)

    print("NODES AND LINKS")
    print("-" * 100)

    # Given transactions_by_address from previous step
    transactions_by_address_agg = {}
    for address in transactions_by_address.keys():
        transactions_by_address_agg[address] = len(transactions_by_address[address])

    # Now, transactions_by_address contains the number of transactions each address is involved in
    print(json.dumps(transactions_by_address_agg, indent=2))

    return transactions_by_address



# {
#   "nodes": [{ "id": "4062045" }, { "id": "4062045" }, { "id": "4062045" }],
#   "links": [
#     { "source": "950642", "target": "4062045" },
#     { "source": "950642", "target": "4062045" },
#     { "source": "950642", "target": "4062045" }
#   ]
# }


if __name__ == "__main__":
    # robinhood
    # start_address = "0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489"  # Replace with your start address
    # binance 7
    # start_address = "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8"  # Replace with your start address
    # beacon
    # start_address = "0x00000000219ab540356cBB839Cbe05303d7705Fa"

    seeds = [
        "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", 
    "0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489", 
    "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    # "0xE92d1A43df510F82C66382592a047d288f85226f",
    # "0x8103683202aa8DA10536036EDef04CDd865C225E",
    # "0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C",
    # "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
    # "0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3", # crypto.com
    # "0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0", # kraken
    # "0x5f397B62502e255f68382791947D54C4B2d37F09", # deribit 8
    ]
    api_key = "replace"  # Replace with your Etherscan API Key
    max_depth = 20  # Replace with your specified degree of depth
    
    all_transactions_list = []
    for seed_addr in seeds:
        transactions_list = bfs_eth_address(seed_addr, api_key, max_depth)
        all_transactions_list += transactions_list
        # global_counter = 0 
        print("%" * 100)
        print("length updated all transactions:", len(all_transactions_list))
        # print(all_transactions_list)

    print(json.dumps(all_transactions_list, indent=2))
    convert_to_addr_dict(all_transactions_list)
    
    # print(transactions_list)  # Print or save to a file, or visualize as per your requirement

