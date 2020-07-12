declare type query = { [key: string]: string };
export function parse(input: string): query;
export function stringify(input: query): string;
