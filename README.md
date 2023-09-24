# ETHIsBeautiful

Demo: https://eth-is-beautiful.vercel.app/

Visualize the beauty of Ethereum transactions with a force-directed D3 graph.

## Description

Our project offers a captivating replay of Ethereum transactions sourced from Etherscan, specifically focusing on the top accounts ranked by ETH value within the blockchain. Using a dynamic force-directed graph, we breathe life into these transactions, representing them as particles that flow from one node to another. This visualization unfolds in a fast-forward mode, condensing time to provide a comprehensive yet expedited view.

In our selection of transactions, we've curated a subset that serves as a microcosm of Ethereum's bustling ecosystem. This includes transactions involving major players like Binance, Robinhood, Crypto.com, Kraken, and other prominent exchanges. By showcasing these transactions, we aim to offer viewers insights into the broader activity within the Ethereum network.

## How it's made

We use Etherscan to obtain the ETH transaction data - we seed our search with our initial big players (obtained by top account value) as we expect them to have a large volume of transactions generally. We proceed to do a hybrid search (combining a BFS/DFS approach) to find relevant data for our graph. Since we're looking to have an illustrative and beautiful visualization, we want to show the activity between various different accounts in a web-like fashion, rather than just hub-and-spokes (with a central node). Doing a purely BFS or DFS approach doesn't lend itself well to such a visualization (you either get these "star-like" hub shapes with BFS or you get long chains with DFS), hence we decided to throw a bit of pseudo-randomness in our BFS to make it non-deterministically jump into some depths, which worked well.

On the frontend, we use ThreeJS to create force-directed graphs with the HTML Canvas and WebGL, which helps us handle larger amounts of data (from a rendering POV). d3-force-3d is the underlying engine backing the physics logic within the app. It's a React app built with TypeScript that uses Tailwind CSS for styling and is deployed with Vercel. We worked on optimizing our data to ensure that we had minimal lag - we were able to do this by de-duplicating transactions between two nodes (keeping the transaction data but collapsing it into a single edge, where we can send multiple partcles to visualize the transactions). 

## Demo/Screenshot

Demo: https://eth-is-beautiful.vercel.app/


Screenshot:

<img width="1564" alt="Screenshot 2023-09-24 at 8 10 36 AM" src="https://github.com/froothacks/ETHIsBeautiful/assets/12927474/07bdf203-e29f-4df5-84f2-c1267d0cfc99">

<img width="1564" alt="Screenshot 2023-09-24 at 8 09 09 AM" src="https://github.com/froothacks/ETHIsBeautiful/assets/12927474/5b8f24ba-e068-447a-bef3-9f25dece7656">


<img width="1113" alt="image" src="https://github.com/froothacks/the-subgraph/assets/12927474/ae32b994-4ada-4128-85ce-b6ac427b8406">

