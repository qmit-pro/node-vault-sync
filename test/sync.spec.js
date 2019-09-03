const vault = require("../src");

describe("test vault function", () => {
    it("should throw for invalid args", () => {
        expect(() => vault("here should be factory")).toThrow();
        expect(() => vault(() => {}, "here should be object")).toThrow();
    });

    it("should create configuration synchronously (with local token)", () => {
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
            debug: true,
        });
        console.log(result);
        expect(result).toMatchObject({
            a: "world",
            b: 2,
            c: 3,
        });
    });

    it("should not create configuration for invalid item (with k8s sa token)", () => {
        const result = vault(async read => {
            return {
                a: (await read("common/data/test-invalid-path")).data.hello,
                b: 2,
                c: 3,
            }
        }, {
            uri: "https://vault.internal.qmit.pro",
            method: "k8s/dev",
            role: "default",
            debug: true,
            ignoreLocalToken: true,
        });
        expect(result).toThrow();
    });

    it("should create configuration asynchronously (with k8s sa token)", () => {
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
            debug: true,
            ignoreLocalToken: true,
        });
        expect(result).resolves.toMatchObject({
            a: "world",
            b: 2,
            c: 3,
        });
    });
});
