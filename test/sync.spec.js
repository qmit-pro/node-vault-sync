const vault = require("../src");

describe("test sync factory", () => {
    // it("should throw for invalid args", () => {
    //     expect(() => vault("here should be factory")).toThrow();
    //     expect(() => vault(() => {}, "here should be object")).toThrow();
    // });

    it("should create static configuration", () => {
        const result = vault(get => {
            return {
                a: 1,
                b: 2,
                c: 3,
            }
        }, {
            uri: "https://vault.internal.qmit.pro",
            role: "default",
            debug: true,
        });
        expect(result).toBeDefined();
    });
});
