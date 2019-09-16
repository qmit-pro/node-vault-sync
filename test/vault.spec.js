const vault = require("../dist");

const opts = {
    uri: "https://vault.internal.qmit.pro",
    method: "k8s/dev",
    role: "default",
    debug: true,
};

describe("test vault.async function", () => {
    it("should throw for invalid args", () => {
        expect(vault.async()).rejects.toThrow();
        expect(vault.async("here should be factory")).rejects.toThrow();
        expect(vault.async(() => {}, "here should be object")).rejects.toThrow();
    });

    it("should be failed to create configuration for invalid item (with local token)", () => {
        expect(
            vault.async(async get => {
                return {
                    a: (await get("common/data/test-invalid-path")).data.hello,
                    b: 2,
                    c: 3,
                }
            }, {
                ...opts,
            })
        )
            .rejects
            .toThrow();
    });

    it("should create configuration asynchronously (with local token)", () => {
        return expect(
            vault.async(async (get, list) => {
                await list("common/metadata");

                return {
                    a: (await get("common/data/test")).data.hello,
                    b: 2,
                    c: 3,
                }
            }, {
                ...opts,
            })
        )
            .resolves
            .toMatchObject({
                a: "world",
                b: 2,
                c: 3,
            });
    });

    it("should create configuration asynchronously (with k8s sa token)", () => {
        return expect(
            vault.async(async get => {
                return {
                    a: (await get("common/data/test")).data.hello,
                    b: (await get("common/data/test")).data.hello,
                    c: 3,
                }
            }, {
                ...opts,
                ignoreLocalToken: true,
            })
        )
            .resolves
            .toMatchObject({
                a: "world",
                b: "world",
                c: 3,
            });
    });


    it("should be failed to create configuration without any token", () => {
        expect(
            vault.async(async get => {
                return {
                    a: (await get("common/data/test")).data.hello,
                    b: 2,
                    c: 3,
                }
            }, {
                ...opts,
                ignoreLocalToken: true,
                ignoreK8sSAToken: true,
            })
        )
            .rejects
            .toThrow();
    });
});


describe("test vault function", () => {
    it("should throw for invalid args", () => {
        // @ts-ignore
        expect(() => vault("here should be factory")).toThrow();
        // @ts-ignore
        expect(() => vault(() => {}, "here should be object")).toThrow();
    });

    it("should create configuration synchronously (with local token)", () => {
        return expect(
            vault(async get => {
                return {
                    a: (await get("common/data/test")).data.hello,
                    b: 2,
                    c: 3,
                }
            }, {
                ...opts,
            })
        )
            .toMatchObject({
                a: "world",
                b: 2,
                c: 3,
            });
    });

    it("should create configuration synchronously (with k8s sa token)", () => {
        return expect(
            vault(async get => {
                return {
                    a: (await get("common/data/test")).data.hello,
                    b: (await get("common/data/test")).data.hello,
                    c: 3,
                }
            }, {
                ...opts,
                ignoreLocalToken: true,
            })
        )
            .toMatchObject({
                a: "world",
                b: "world",
                c: 3,
            });
    });


    it("should be failed to create configuration for invalid item (with local token)", () => {
        expect(() => {
            vault(async get => {
                return {
                    a: (await get("common/data/test-invalid-path")).data.hello,
                    b: 2,
                    c: 3,
                }
            }, {
                ...opts,
            });
        })
            .toThrow();
    });

    it("should be failed to create configuration without any token", () => {
        expect(() => {
            vault(async get => {
                return {
                    a: (await get("common/data/test")).data.hello,
                    b: 2,
                    c: 3,
                }
            }, {
                ...opts,
                ignoreLocalToken: true,
                ignoreK8sSAToken: true,
            });
        })
            .toThrow();
    });
});

