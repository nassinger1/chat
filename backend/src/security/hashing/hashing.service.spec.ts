import { HashingService } from "./hashing.service.js";

describe("HashingService", () => {
  const service = new HashingService();

  it("does not return the password", async () => {
    await expect(service.hash("password123")).resolves.not.toBe("password123");
  });

  it("accepts the right password", async () => {
    const storedHash = await service.hash("password123");

    await expect(service.compare("password123", storedHash)).resolves.toBe(
      true,
    );
  });

  it("rejects a wrong password", async () => {
    const storedHash = await service.hash("password123");

    await expect(service.compare("wrong", storedHash)).resolves.toBe(false);
  });

  it("rejects a missing hash", async () => {
    await expect(service.compare("password123", undefined)).resolves.toBe(
      false,
    );
  });
});
