import { MethodNotFoundException } from "../src/core";
import { MethodManager } from "../src";

describe("MethodManager", () => {
  const methodManager = new MethodManager();
  describe("add", () => {
    it("should be method add", () => {
      methodManager.add("test", (a, b, c) => {
        return { a, b, c };
      });

      expect(methodManager.exist("test")).toEqual(true);
    });
  });
  describe("names", () => {
    it("should be return method names", () => {
      expect(methodManager.names()).toEqual(["test"]);
    });
  });
  describe("exist", () => {
    it("should be true", () => {
      expect(methodManager.exist("test")).toEqual(true);
    });
  });
  describe("call", () => {
    it("should be callable", async () => {
      await expect(methodManager.call("test", [1, 2, 3])).resolves.toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
    });
    it("should be throw MethodNotFoundException", async () => {
      await expect(async () => methodManager.call("foo", [])).rejects.toThrow(
        MethodNotFoundException
      );
    });
  });
  describe("remove", () => {
    it("should be method delete", () => {
      methodManager.remove("test");
      expect(methodManager.names()).toEqual([]);
    });
  });
});
