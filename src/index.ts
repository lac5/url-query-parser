import Query from "./query";

export { Query };

export function getQuery(s: string): { [key: string]: string[] } {
    return Query.search(s).toObject();
}

export default getQuery;
