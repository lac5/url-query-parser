declare type quwry = { [key: string]: string };
export function parse(input: string): quwry;
export function stringify(input: quwry): string;
