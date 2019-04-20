import Query from "./query";

export { Query };

export function parseQuery(s: string): { [key: string]: string[] } {
    return Query.parse(s).toObject();
}

export default Query;
