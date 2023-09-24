export type TGraphData = {
    nodes: {
        id: string;
        user: string;
    }[];
    links: {
        source: string;
        target: string;
        data: { value: string; timestamp: string }[];
    }[];
};