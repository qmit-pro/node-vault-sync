const vault = require("../src");

describe("test vault function", () => {
    it("should throw for invalid args", () => {
        expect(() => vault("here should be factory")).toThrow();
        expect(() => vault(() => {}, "here should be object")).toThrow();
    });

    it("should create configuration synchronously", () => {
        const result = vault(async read => {
            return {
                a: (await read("common/data/test")).data.hello,
                b: 2,
                c: 3,
            }
        }, {
            uri: "https://vault.internal.qmit.pro",
            method: "k8s/dev",
            role: "default",
            debug: false,
        });
        console.log(result);
        expect(result).toMatchObject({
            a: "world",
            b: 2,
            c: 3,
        });
    });

    it("should create configuration asynchronously", () => {
        const result = vault.async(async read => {
            return {
                a: (await read("common/data/test")).data.hello,
                b: 2,
                c: 3,
            }
        }, {
            uri: "https://vault.internal.qmit.pro",
            method: "k8s/dev",
            role: "default",
            debug: false,
        });
        expect(result).resolves.toMatchObject({
            a: "world",
            b: 2,
            c: 3,
        });
    });
});
