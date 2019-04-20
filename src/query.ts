type setterFn = (this: Query, key: string, value: string, found: number) => any;
type finderFn = (this: Query, key: string, value: string, found: number) => boolean;

export class Query {
    public static parse(s: string): Query {
        return new Query(s);
    }

    public static search(url: string): Query {
        const hash = url.indexOf("#");
        const ques = url.indexOf("?");
        if (ques !== -1) {
            if (hash === -1) {
                return new Query(url.slice(ques + 1));
            } else if (ques < hash) {
                return new Query(url.slice(ques + 1, hash));
            }
        }
        return new Query("");
    }

    public static stringify(o: object): string {
        return new Query().add(o).toString();
    }

    private query: string[] = [];

    constructor(s: string = "") {
        let eql: number;
        let amp: number;
        for (let i = 0, ilen = s.length; i < ilen; i += 1) {
            eql = s.indexOf("=", i);
            amp = s.indexOf("&", i);
            if (amp === -1) {
                if (eql === -1) {
                    this.query.push(decodeURIComponent(s.slice(i).replace(/\+/g, " ")), "");
                } else {
                    this.query.push(
                        decodeURIComponent(s.slice(i, eql).replace(/\+/g, " ")),
                        decodeURIComponent(s.slice(eql + 1).replace(/\+/g, " ")),
                    );
                }
                break;
            } else {
                if (eql === -1 || amp < eql) {
                    this.query.push(decodeURIComponent(s.slice(i, amp).replace(/\+/g, " ")), "");
                } else {
                    this.query.push(
                        decodeURIComponent(s.slice(i, eql).replace(/\+/g, " ")),
                        decodeURIComponent(s.slice(eql + 1, amp).replace(/\+/g, " ")),
                    );
                }
                i = amp;
            }
        }
    }

    public get(key: string | RegExp): string[];
    public get(key: string | RegExp, index: number): string | void;

    public get(key: string | RegExp, index?: number): string | string[] | void {
        if (index == null) {
            const values: string[] = [];
            if (key instanceof RegExp) {
                for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                    if (key.test(this.query[i])) {
                        values.push(this.query[i + 1]);
                    }
                }
            } else {
                for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                    if (key === this.query[i]) {
                        values.push(this.query[i + 1]);
                    }
                }
            }
            return values;
        }

        if (key instanceof RegExp) {
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (key.test(this.query[i])) {
                    if (index <= 0) {
                        return this.query[i + 1];
                    }
                    index -= 1;
                }
            }
        } else {
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (key === this.query[i]) {
                    if (index <= 0) {
                        return this.query[i + 1];
                    }
                    index -= 1;
                }
            }
        }
    }

    public length(key?: string | RegExp): number {
        let length = 0;
        if (key instanceof RegExp) {
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (key.test(this.query[i])) {
                    length += 1;
                }
            }
        } else if (typeof key === "string") {
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (key === this.query[i]) {
                    length += 1;
                }
            }
        } else {
            const foundKeys: string[] = [];
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (foundKeys.indexOf(this.query[i]) === -1) {
                    foundKeys.push(this.query[i]);
                    length += 1;
                }
            }
        }
        return length;
    }

    public has(key: string | RegExp | finderFn | number): boolean;
    public has(n: number | string | RegExp, key: string | RegExp | finderFn): boolean;

    public has(n?: any, key?: any): boolean {
        if (arguments.length < 1) {
            return this.query.length > 0;
        } else if (arguments.length < 2) {
            if (typeof n === "function") {
                const foundKeys: { [k: string]: number } = {};
                for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                    if (!foundKeys.hasOwnProperty(this.query[i])) {
                        foundKeys[this.query[i]] = 0;
                    } else {
                        foundKeys[this.query[i]] += 1;
                    }
                    if (n.call(this, this.query[i], this.query[i + 1], foundKeys[this.query[i]])) {
                        return true;
                    }
                }
                return false;
            }
            if (!isNaN(n)) {
                const foundKeys: string[] = [];
                n = +n;
                for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                    if (foundKeys.indexOf(this.query[i]) === -1) {
                        foundKeys.push(this.query[i]);
                        if (n > 0) {
                            if (n <= 1) {
                                return true;
                            }
                            n -= 1;
                        } else {
                            if (n >= -1) {
                                return false;
                            }
                            n += 1;
                        }
                    }
                }
                return n < 1;
            } else {
                key = n;
                n = 1;
            }
        } else if (typeof key === "function") {
            [key, n] = [n, key];
            let foundKeys = 0;
            if (key && typeof key.test === "function") {
                for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                    if (key.test(this.query[i])) {
                        if (n.call(this, this.query[i], this.query[i + 1], foundKeys)) {
                            return true;
                        }
                        foundKeys += 1;
                    }
                }
            } else {
                key += "";
                for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                    if (key === this.query[i]) {
                        if (n.call(this, this.query[i], this.query[i + 1], foundKeys)) {
                            return true;
                        }
                        foundKeys += 1;
                    }
                }
            }
            return false;
        } else if (isNaN(n)) {
            n = 1;
        }
        key = key == null ? "" : key;
        n = +n;
        if (key instanceof RegExp) {
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (key.test(this.query[i])) {
                    if (n === 0) {
                        return false;
                    } else if (n > 0) {
                        if (n <= 1) {
                            return true;
                        }
                        n -= 1;
                    } else {
                        if (n >= -1) {
                            return false;
                        }
                        n += 1;
                    }
                }
            }
        } else {
            key += "";
            for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
                if (key === this.query[i]) {
                    if (n === 0) {
                        return false;
                    } else if (n > 0) {
                        if (n <= 1) {
                            return true;
                        }
                        n -= 1;
                    } else {
                        if (n >= -1) {
                            return false;
                        }
                        n += 1;
                    }
                }
            }
        }
        return n < 1;
    }

    public sort(): this {
        for (let i = 2, ilen = this.query.length; i < ilen; i += 2) {
            for (let j = 0; j < i; j += 2) {
                if (
                    this.query[j] > this.query[i] ||
                    (this.query[j] === this.query[i] && this.query[j + 1] > this.query[i + 1])
                ) {
                    const splice = this.query.splice(i, 2);
                    this.query.splice(j, 0, splice[0], splice[1]);
                    break;
                }
            }
        }
        return this;
    }

    public add(keys: object | string): this;
    public add(key: string, value: any): this;

    public add(key: string, values?: any): this {
        if (arguments.length < 2) {
            if (key && typeof key === "object") {
                return this.add("", key);
            } else {
                return this.add(key, "");
            }
        }
        if (values && typeof values === "object") {
            if (values.length >= 0) {
                if (key) {
                    for (let i = 0, ilen = values.length; i < ilen; i += 1) {
                        if (values[i] && typeof values[i] === "object" && values[i].length >= 0) {
                            this.add((key ? key + "." : "") + values[i][0], values[i].slice(1));
                        } else {
                            this.add(key, values[i]);
                        }
                    }
                } else {
                    for (let i = 0, ilen = values.length; i < ilen; i += 1) {
                        if (values[i] && typeof values[i] === "object") {
                            if (values[i].length >= 0) {
                                this.add(values[i][0], values[i].slice(1));
                            } else {
                                this.add("", values[i]);
                            }
                        } else {
                            this.query.push("" + values[i], "");
                        }
                    }
                }
            } else {
                if (key) {
                    for (const k of Object.keys(values)) {
                        this.add(key + "." + k, values[k]);
                    }
                } else {
                    for (const k of Object.keys(values)) {
                        this.add(k, values[k]);
                    }
                }
            }
        } else {
            if (key) {
                if (values || values === "" || values === 0) {
                    this.query.push(key, values === true ? "" : String(values));
                }
            } else {
                this.query.push(values == null ? "" : String(values), "");
            }
        }
        return this;
    }

    public set(keys: object | setterFn): this;
    public set(key: string | RegExp, value: string | number | boolean | object | setterFn): this;

    public set(key: any, values?: any): this {
        let i: number;
        let ilen: number;
        let j: number;
        let jlen: number;

        if (arguments.length < 2) {
            if (typeof key === "function") {
                const foundKeys: { [k: string]: number } = {};
                for (i = 0, ilen = this.query.length; i < ilen; ) {
                    if (!foundKeys.hasOwnProperty(this.query[i])) {
                        foundKeys[this.query[i]] = 0;
                    } else {
                        foundKeys[this.query[i]] += 1;
                    }
                    const v = key.call(this, this.query[i], this.query[i + 1], foundKeys[this.query[i]]);
                    if (v || v === "" || v === 0) {
                        this.query[i + 1] = v === true ? "" : String(v);
                        i += 2;
                    } else {
                        this.query.splice(i, 2);
                        ilen = this.query.length;
                    }
                }
                return this;
            } else if (key && typeof key === "object" && typeof key.test !== "function") {
                return this.set("", key);
            } else {
                return this.set(key, false);
            }
        }
        key = key == null ? "" : key;

        i = 0;
        ilen = this.query.length;
        if (values && typeof values === "object") {
            jlen = values.length;
            if (jlen >= 0) {
                j = 0;
                if (key instanceof RegExp) {
                    while (i < ilen) {
                        if (key.test(this.query[i])) {
                            if (j < jlen) {
                                if (values[j] || values[j] === "" || values[j] === 0) {
                                    this.query[i + 1] = values[j] === true ? "" : "" + values[j];
                                } else {
                                    this.query.splice(i, 2);
                                    ilen = this.query.length;
                                }
                                j += 1;
                            } else {
                                this.query.splice(i, 2);
                                ilen = this.query.length;
                                continue;
                            }
                        }
                        i += 2;
                    }
                } else {
                    key += "";
                    let foundKeys: string[] = [];
                    if (key) {
                        while (i < ilen) {
                            if (key === this.query[i]) {
                                if (j < jlen) {
                                    if (values[j] && typeof values[j] === "object") {
                                        foundKeys.push(values[j]);
                                    } else if (values[j] || values[j] === "" || values[j] === 0) {
                                        this.query[i + 1] = values[j] === true ? "" : "" + values[j];
                                    } else {
                                        this.query.splice(i, 2);
                                        ilen = this.query.length;
                                    }
                                    j += 1;
                                } else {
                                    this.query.splice(i, 2);
                                    ilen = this.query.length;
                                    continue;
                                }
                            }
                            i += 2;
                        }
                        while (j < jlen) {
                            if (values[j] && typeof values[j] === "object") {
                                foundKeys.push(values[j]);
                            } else if (values[j] || values[j] === "" || values[j] === 0) {
                                this.query.push(key, values[j] === true ? "" : "" + values[j]);
                            }
                            j += 1;
                        }
                    } else {
                        foundKeys = values;
                    }
                    (j = 0), (jlen = foundKeys.length);
                    while (j < jlen) {
                        if (foundKeys[j] && typeof foundKeys[j] === "object" && foundKeys[j].length >= 0) {
                            this.set((key ? key + "." : "") + foundKeys[j][0], foundKeys[j].slice(1));
                        } else {
                            this.set((key ? key + "." : "") + foundKeys[j], true);
                        }
                        j += 1;
                    }
                }
            } else {
                key += "";
                if (key) {
                    for (const k of Object.keys(values)) {
                        this.set(key + "." + k, values[k]);
                    }
                } else {
                    for (const k of Object.keys(values)) {
                        this.set(k, values[k]);
                    }
                }
            }
        } else {
            if (key instanceof RegExp) {
                if (typeof values === "function") {
                    j = 0;
                    while (i < ilen) {
                        if (key.test(this.query[i])) {
                            const v = values.call(this, this.query[i], this.query[i + 1], j);
                            j += 1;
                            if (v || v === "" || v === 0) {
                                this.query[i + 1] = v === true ? "" : String(v);
                            } else {
                                this.query.splice(i, 2);
                                ilen = this.query.length;
                            }
                        }
                        i += 2;
                    }
                } else {
                    while (i < ilen) {
                        if (key.test(this.query[i])) {
                            if (values || values === "" || values === 0) {
                                this.query[i + 1] = values === true ? "" : String(values);
                            } else {
                                this.query.splice(i, 2);
                                ilen = this.query.length;
                            }
                        }
                        i += 2;
                    }
                }
            } else {
                key += "";
                if (typeof values === "function") {
                    j = 0;
                    while (i < ilen) {
                        if (key === this.query[i]) {
                            const v = values.call(this, this.query[i], this.query[i + 1], j);
                            j += 1;
                            if (v || v === "" || v === 0) {
                                this.query[i + 1] = v === true ? "" : String(v);
                            } else {
                                this.query.splice(i, 2);
                                ilen = this.query.length;
                            }
                        }
                        i += 2;
                    }
                } else {
                    let foundKeys = false;
                    while (i < ilen) {
                        if (key === this.query[i]) {
                            if (values || values === "" || values === 0) {
                                this.query[i + 1] = values === true ? "" : String(values);
                                foundKeys = true;
                            } else {
                                this.query.splice(i, 2);
                            }
                            break;
                        }
                        i += 2;
                    }
                    if (i >= ilen) {
                        if (values || values === "" || values === 0) {
                            this.query.push(key, values === true ? "" : String(values));
                        }
                    } else {
                        if (foundKeys) {
                            i += 2;
                        }
                        ilen = this.query.length;
                        while (i < ilen) {
                            if (key === this.query[i]) {
                                this.query.splice(i, 2);
                                ilen = this.query.length;
                            } else {
                                i += 2;
                            }
                        }
                    }
                }
            }
        }
        return this;
    }

    public remove(keys: string | string[] | RegExp | finderFn): this {
        keys = keys == null ? "" : keys;
        if (typeof keys === "function") {
            for (let i = 0, ilen = this.query.length; i < ilen; ) {
                if (keys.call(this, this.query[i], this.query[i + 1], i / 2)) {
                    this.query.splice(i, 2);
                    ilen = this.query.length;
                } else {
                    i += 2;
                }
            }
        } else if (keys && typeof keys === "object") {
            if (keys instanceof RegExp) {
                for (let i = 0, ilen = this.query.length; i < ilen; ) {
                    if (keys.test(this.query[i])) {
                        this.query.splice(i, 2);
                        ilen = this.query.length;
                    } else {
                        i += 2;
                    }
                }
            } else if (keys.length >= 0) {
                for (let i = 0, ilen = this.query.length; i < ilen; ) {
                    if (keys.indexOf(this.query[i]) !== -1) {
                        this.query.splice(i, 2);
                        ilen = this.query.length;
                    } else {
                        i += 2;
                    }
                }
            }
        } else {
            keys += "";
            for (let i = 0, ilen = this.query.length; i < ilen; ) {
                if (keys === this.query[i]) {
                    this.query.splice(i, 2);
                    ilen = this.query.length;
                } else {
                    i += 2;
                }
            }
        }
        return this;
    }

    public *[Symbol.iterator](from: number = 0, to: number = 0): IterableIterator<[string, string]> {
        const max = this.query.length / 2;
        if (from < 0) {
            from = max + from;
            if (from < 0) {
                from = 0;
            }
        }
        if (from > max) {
            from = max;
        }
        if (to < 0) {
            to = max + to;
        }
        if (to < 0 || to > max) {
            to = max;
        }
        if (from > to) {
            [from, to] = [to, from];
        }
        for (let i = from * 2, ilen = to * 2; i < ilen; i += 2) {
            yield [this.query[i], this.query[i + 1]];
        }
    }

    public valueOf(): string {
        return this.toString();
    }

    public toString(): string {
        let query = "";
        for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
            query +=
                (query ? "&" : "") +
                encodeURIComponent(this.query[i]).replace(/%20/g, "+") +
                (this.query[i + 1] ? "=" + encodeURIComponent(this.query[i + 1]).replace(/%20/g, "+") : "");
        }
        return query;
    }

    public toObject(): { [key: string]: string[] } {
        const object: { [key: string]: string[] } = {};
        for (let i = 0, ilen = this.query.length; i < ilen; i += 2) {
            if (!object.hasOwnProperty(this.query[i])) {
                object[this.query[i]] = [this.query[i + 1]];
            } else {
                object[this.query[i]].push(this.query[i + 1]);
            }
        }
        return object;
    }
}

export default Query;
