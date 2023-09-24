import json
import random
import math


def enrich_data(input_data):
    for link in input_data["links"]:
        # Assign a random curvature between -1 and 1
        link["curvature"] = random.uniform(-0.6, 0.6)

        # Assign a rotation as a multiple of PI
        rotation_multiple = random.choice(
            [0, 1 / 6, 1 / 2, 1, 5 / 6, 1, 7 / 6, 3 / 2, 11 / 6, 2]
        )
        link["rotation"] = math.pi * rotation_multiple

    return input_data


def main():
    # Read existing data
    with open("../data/etherscan.json", "r") as f:
        data = json.load(f)

    # Enrich the data
    enriched_data = enrich_data(data)

    # Save enriched data back to file
    with open("../data/enriched_etherscan.json", "w") as f:
        json.dump(enriched_data, f, indent=4)


if __name__ == "__main__":
    main()
