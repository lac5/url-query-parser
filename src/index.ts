import Query from "./query";

export { Query };

export default function getQuery(s: string): { [key: string]: string[] } {
    return Query.search(s).toObject();
}
