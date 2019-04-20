import "jasmine";
import Query from "./query";

describe("Query", function() {
    it("creates a Query object.", function() {
        expect(new Query()).toEqual(jasmine.any(Query));
    });

    describe("instance", function() {
        describe(".get(key)", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("gets all values of a key.", function() {
                expect(query.get("a")).toEqual(["b", "c"]);
            });

            it("can also use a regular expression.", function() {
                expect(query.get(/^a/i)).toEqual(["b", "c", "f"]);
                expect(query.get(/^/)).toEqual(["b", "c", "e", "f"]);
            });
        });

        describe(".get(key, index)", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("gets the value of a key at an index.", function() {
                expect(query.get("a", 0)).toBe("b");
            });

            it("can also use a regular expression.", function() {
                expect(query.get(/^a/i, 2)).toBe("f");
            });

            it("is the same as `.get(key)[index]`.", function() {
                expect(query.get(/^a/i, 2)).toEqual(query.get(/^a/i)[2]);
            });
        });

        describe(".length()", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("tells how many unique keys there are.", function() {
                expect(query.length()).toBe(3);
            });
        });

        describe(".length(key)", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("tells how many times a key appears.", function() {
                expect(query.length("a")).toBe(2);
            });

            it("can also use a regular expression.", function() {
                expect(query.length(/^a/i)).toBe(3);
                expect(query.length(/^/)).toBe(4);
            });
        });

        describe(".has(key)", function() {
            let query: Query = new Query("a=b&a=c&d=e&a2=f");

            it("tells if a key exists.", function() {
                expect(query.has("a")).toBe(true);
            });

            it("can also use a regular expression.", function() {
                expect(query.has(/^a/i)).toBe(true);
            });

            it("can also use a function.", function() {
                expect(
                    query.has(function(key, value, i) {
                        return key === "a" && value === "c";
                    }),
                ).toBe(true);
            });
        });

        describe(".has(number)", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("can check if it has no keys.", function() {
                expect(query.has(0)).toBe(false);
            });

            it("can check if it has more than a number of unique keys.", function() {
                expect(query.has(0)).toBe(false);
                expect(query.has(1)).toBe(true);
                expect(query.has(2)).toBe(true);
                expect(query.has(3)).toBe(true);
                expect(query.has(4)).toBe(false);
            });

            it("can check if it has no more than a number of unique keys", function() {
                expect(query.has(0)).toBe(false);
                expect(query.has(-1)).toBe(false);
                expect(query.has(-2)).toBe(false);
                expect(query.has(-3)).toBe(false);
                expect(query.has(-4)).toBe(true);
            });
        });

        describe(".has(number, key)", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("tells if no keys exists if number is 0.", function() {
                expect(query.has(0, "a")).toBe(false);
            });

            it("tells if that number of keys exists.", function() {
                expect(query.has(1, "a")).toBe(true);
                expect(query.has(2, "a")).toBe(true);
                expect(query.has(3, "a")).toBe(false);
            });

            it("tells if regex appears that number of times.", function() {
                expect(query.has(1, /^a/i)).toBe(true);
                expect(query.has(2, /^a/i)).toBe(true);
                expect(query.has(3, /^a/i)).toBe(true);
                expect(query.has(4, /^a/i)).toBe(false);
            });

            it("tells if that number has no more than -number if number is negative.", function() {
                expect(query.has(-1, "a")).toBe(false);
                expect(query.has(-2, "a")).toBe(false);
                expect(query.has(-3, "a")).toBe(true);
            });
        });

        describe(".has(key, test)", function() {
            let query = new Query("a=b&a=c&d=e&a2=f");

            it("checks using function test on all keys that match key.", function() {
                expect(
                    query.has(/^a/i, function(key, value, i) {
                        return i > 1 && key === "a2";
                    }),
                ).toBe(true);
            });
        });

        describe(".sort()", function() {
            it("sorts.", function() {
                expect(
                    Query.parse("z=0&y=2&y=1&c=1&c=2&b=0&a=0")
                        .sort()
                        .toString(),
                ).toBe("a=0&b=0&c=1&c=2&y=1&y=2&z=0");
            });
        });

        describe(".add(key)", function() {
            let query = new Query();

            it("adds a key to the query.", function() {
                let query = new Query();

                query.add("a");

                expect(query.toString()).toBe("a");
            });

            it("iterates objects.", function() {
                let query = new Query("a");

                query.add({ a: "b", c: "d" });

                expect(query.toString()).toBe("a&a=b&c=d");
            });

            it("iterates arrays.", function() {
                let query = new Query("a&a=b&c=d");

                query.add(["a", "b", "c", "d"]);

                expect(query.toString()).toBe("a&a=b&c=d&a&b&c&d");
            });

            it("iterates key-value arrays.", function() {
                let query = new Query("a&a=b&c=d&a&b&c&d");

                query.add([["a", "b"], ["c", "d"]]);

                expect(query.toString()).toBe("a&a=b&c=d&a&b&c&d&a=b&c=d");
            });
        });

        describe(".add(key, value)", function() {
            it("adds a key to the query with that value", function() {
                let query = new Query();

                query.add("a", "b");

                expect(query.toString()).toBe("a=b");
            });

            it("uses dot notation for nested objects.", function() {
                let query = new Query("a&b");

                query.add("a", { b: "c", d: { e: "f", g: "h" } });

                expect(query.toString()).toBe("a&b&a.b=c&a.d.e=f&a.d.g=h");
            });

            it("can iterate arrays.", function() {
                let query = new Query("a&b&a.b=c&a.d.e=f&a.d.g=h");

                query.add("b", ["c", "d", "e"]);

                expect(query.toString()).toBe("a&b&a.b=c&a.d.e=f&a.d.g=h&b=c&b=d&b=e");
            });

            it("can iterate key-value pairs.", function() {
                let query = new Query("a&b&a.b=c&a.d.e=f&a.d.g=h&b.c&b.d&b.e");

                query.add("c", [["d", "d"], ["e", "f", "g"], ["h"]]);

                expect(query.toString()).toBe("a&b&a.b=c&a.d.e=f&a.d.g=h&b.c&b.d&b.e&c.d=d&c.e=f&c.e=g");
            });
        });

        describe(".set(key, value)", function() {
            it("adds keys if they don't exist.", function() {
                let query = new Query();

                query.set("a", "b").set("c", "d");

                expect(query.toString()).toBe("a=b&c=d");
            });

            it("sets keys to values if they do exist.", function() {
                let query = new Query("a=b&c=d");

                query.set("a", "d").set("c", "b");

                expect(query.toString()).toBe("a=d&c=b");
            });

            it("removes excess keys.", function() {
                let query = new Query("a=d&c=b");

                query.add("a", "").set("a", "");

                expect(query.toString()).toBe("a&c=b");
            });

            it("iterates arrays.", function() {
                let query = new Query("a&c=b");

                query.add("a", "").set("a", ["b", "c"]);

                expect(query.toString()).toBe("a=b&c=b&a=c");
            });

            it("can use regular expressions.", function() {
                let query = new Query("a=b&c=b&a=c");

                query.add("a2", "").set(/^a/i, "d");

                expect(query.toString()).toBe("a=d&c=b&a=d&a2=d");

                query.set(/^a/i, [""]);

                expect(query.toString()).toBe("a&c=b");
            });

            it("delets keys that are set to `false`, `null`, or `undefined`.", function() {
                let query = new Query("a&c=b");

                query.set("a", false);

                expect(query.toString()).toBe("c=b");

                query.set("c", 0);

                expect(query.toString()).toBe("c=0");
            });

            it("adds keys if they don't already exist.", function() {
                let query = new Query("c=0");

                query.set("a", "b");

                expect(query.toString()).toBe("c=0&a=b");

                query.set("a", ["c", "d"]);

                expect(query.toString()).toBe("c=0&a=c&a=d");
            });

            it("uses dot notation for nested objects.", function() {
                let query = new Query("c=0&a=c&a=d");

                query.set("a", { b: "c", d: { e: "f", g: "h" } });

                expect(query.toString()).toBe("c=0&a=c&a=d&a.b=c&a.d.e=f&a.d.g=h");
            });

            it("can iterate key-value pairs.", function() {
                let query = new Query("c=0&a=c&a=d&a.b=c&a.d.e=f&a.d.g=h");

                query.set("c", [["d", "d"], ["e", "f", "g"], ["d"]]);

                expect(query.toString()).toBe("c=0&a=c&a=d&a.b=c&a.d.e=f&a.d.g=h&c.e=f&c.e=g");
            });

            it("can use function to set values.", function() {
                let query = new Query("c=0&a&c=a&d&a.b=c&a.d.e=f&a.d.g=h&c.e=f&c.e=g");

                query.set(/^a/i, function(key, value, i) {
                    if (i < 3) {
                        return key + "-" + i;
                    } else {
                        return false;
                    }
                });

                expect(query.toString()).toBe("c=0&a=a-0&c=a&d&a.b=a.b-1&a.d.e=a.d.e-2&c.e=f&c.e=g");

                query.set("a", function(key, value, i) {
                    return key === "a";
                });

                expect(query.toString()).toBe("c=0&a&c=a&d&a.b=a.b-1&a.d.e=a.d.e-2&c.e=f&c.e=g");
            });
        });

        describe(".set(keys)", function() {
            it("iterates objects.", function() {
                let query = new Query("a=b&c=d");

                query.set({ a: "d", c: "b" });

                expect(query.toString()).toBe("a=d&c=b");
            });

            it("iterates array.", function() {
                let query = new Query("a=b&c=d");

                query.set(["a", "b", "c", "d"]);

                expect(query.toString()).toBe("a&c&b&d");
            });

            it("iterates key-value array.", function() {
                let query = new Query("a=b&c=d");

                query.set([["a", "b"], ["c", "d"]]);

                expect(query.toString()).toBe("a=b&c=d");
            });

            it("iterates functions.", function() {
                let query = new Query("a=0&a=1&b=2&b=3");

                query.set(function(key, value, i) {
                    return value;
                });

                expect(query.toString()).toBe("a=0&a=1&b=2&b=3");

                query.set(function(key, value, i) {
                    return !!key && !!value && i === 0;
                });

                expect(query.toString()).toBe("a&b");
            });
        });

        describe(".remove(keys)", function() {
            it("removes keys", function() {
                let query = new Query("a=b&a=c&d=e&d=f&a2=3&g=h&j=i");

                query.remove("a");

                expect(query.toString()).toBe("d=e&d=f&a2=3&g=h&j=i");
            });

            it("can match from arrays.", function() {
                let query = new Query("a=b&a=c&d=e&d=f&a2=3&g=h&j=i");

                query.remove(["d", "j"]);

                expect(query.toString()).toBe("a=b&a=c&a2=3&g=h");
            });

            it("can match from regular expressions.", function() {
                let query = new Query("a=b&a=c&d=e&d=f&a2=3&g=h&j=i");

                query.remove(/^a/i);

                expect(query.toString()).toBe("d=e&d=f&g=h&j=i");
            });

            it("can match from functions.", function() {
                let query = new Query("a=b&a=c&d=e&d=f&a2=3&g=h&j=i");

                query.remove(function(key, value, i) {
                    return key === "g" && value === "h" && i === 5;
                });

                expect(query.toString()).toBe("a=b&a=c&d=e&d=f&a2=3&j=i");
            });
        });

        describe(".toString()", function() {
            it("returns the query string form of the query.", function() {
                let query = "a&b=c&d";

                expect(new Query(query).toString()).toBe(query);
            });
        });

        describe(".toObject()", function() {
            it("returns an ordinary object form of the query.", function() {
                let query = "a=0&b=0&a=1&c=0";

                expect(new Query(query).toObject()).toEqual({
                    a: ["0", "1"],
                    b: ["0"],
                    c: ["0"],
                });
            });
        });

        describe(".valueOf()", function() {
            it("returns the query string form of the query.", function() {
                let query = "a&b=c&d";

                expect(new Query(query).valueOf()).toBe(query);
            });

            it("is the same as toString().", function() {
                let query = new Query("a&b=c&d");

                expect(query.valueOf()).toBe(query.toString());
            });
        });
    });

    describe(".parse(string)", function() {
        it("parses strings.", function() {
            let query = Query.parse("a=b&c=d");

            expect(query.toString()).toBe("a=b&c=d");
        });

        it("decodes URI components, replacing `+`s with ` `s.", function() {
            let query = Query.parse("a+b=c+d&e=%26");

            expect(query.toString()).toBe("a+b=c+d&e=%26");
        });
    });

    describe(".search(url)", function() {
        it("parses the query string in a URL.", function() {
            let query = Query.search("http://example.com/?q=blah+blah#ingore-me");

            expect(query.toString()).toBe("q=blah+blah");
        });

        it("requires `?` to be before any `#` to find the query string.", function() {
            expect(Query.search("q=blah+blah").toString()).toBe("");
            expect(Query.search("#?q=blah+blah").toString()).toBe("");
            expect(Query.search("?q=blah+blah").toString()).toBe("q=blah+blah");
            expect(Query.search("?q=blah+blah#?q=blah+blah").toString()).toBe("q=blah+blah");
        });
    });

    describe(".stringify(object)", function() {
        it("turns objects into query strings.", function() {
            expect(Query.stringify({ a: "b", c: "d" })).toBe("a=b&c=d");
        });

        it("can use 2D key-value arrays instead of objects.", function() {
            expect(Query.stringify([["a", "b"], ["c", "d"]])).toBe("a=b&c=d");
        });

        it("iterates keys that have array values.", function() {
            expect(Query.stringify({ a: ["b", "c", "d"] })).toBe("a=b&a=c&a=d");

            expect(Query.stringify([["a", "b", "c", "d"]])).toBe("a=b&a=c&a=d");
        });

        it('puts keys that are `true` or `""` to be just the keys with no `=`, while `false`, `undefined`, and `null` are ignored.', function() {
            expect(
                Query.stringify({
                    true: true,
                    empty: "",
                    false: false,
                    undefined: undefined,
                    null: null,
                }),
            ).toBe("true&empty");
        });
    });
});
