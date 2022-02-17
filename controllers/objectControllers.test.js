const objectControllers = require("./objectControllers")
// @ponicode
describe("objectControllers.getAllObjects", () => {
    test("0", async () => {
        await objectControllers.getAllObjects(200, { status: () => 400 })
    })

    test("1", async () => {
        await objectControllers.getAllObjects(429, { status: () => 400 })
    })

    test("2", async () => {
        await objectControllers.getAllObjects(400, { status: () => 400 })
    })

    test("3", async () => {
        await objectControllers.getAllObjects(500, { status: () => 200 })
    })

    test("4", async () => {
        await objectControllers.getAllObjects(400, { status: () => 429 })
    })

    test("5", async () => {
        await objectControllers.getAllObjects(-Infinity, { status: () => -Infinity })
    })
})
